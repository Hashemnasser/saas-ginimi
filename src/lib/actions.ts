"use server";

import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs"; // تأكد من التوافق مع package.json
import crypto from "crypto";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { checkSubscription } from "./subscription";
import { dispatchWebhook } from "./webhook-dispatcher";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function loginWithGithub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function generateApiKey(): Promise<{
  success?: string;
  error?: string;
  apiKey?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const newKey = `sk_live_${crypto.randomBytes(32).toString("hex")}`;
  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        apiKey: newKey,
        apiKeyEnabled: true,
        apiKeyCreatedAt: new Date(),
      },
    });
    return { success: "API key generated", apiKey: newKey };
  } catch (error) {
    return { error: "Failed to generate API key" };
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const newName = formData.get("name") as string;
  if (!newName || newName.trim().length === 0) {
    return { error: "Name cannot be empty" };
  }
  if (newName.length > 50) {
    return { error: "Name is too long" };
  }
  if (!session?.user?.email) return { error: "Not authorized" };

  try {
    await db.user.update({
      where: { email: session.user.email },
      data: { name: newName },
    });

    // هذه هي "النكشة": تخبر نيكست أن البيانات تغيرت، فيقوم بتحديث الصفحات فوراً
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { success: "Profile updated successfully" };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});
export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // التحقق من وجود الحقول الأساسية
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // التحقق من الصحة باستخدام Zod (كما فعلنا سابقاً)
  const parsed = registerSchema.safeParse({ email, password, name });
  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { error: errorMessages };
  }

  try {
    // 1. التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    // 2. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. إنشاء المستخدم في قاعدة البيانات
    await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(), // ✅ تفعيل البريد الإلكتروني تلقائياً
        isActive: true, // يمكنك أيضاً تفعيل الحساب مباشرة
      },
    });
    try {
      // ✅ 4. تسجيل الدخول مباشرة بعد إنشاء الحساب
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard", // المستخدم سيذهب إلى لوحة التحكم مباشرة
      });
    } catch (error) {
      if (isRedirectError(error)) throw error;
      // إذا كان خطأ مصادقة حقيقي، نتعامل معه
      if (error instanceof AuthError) {
        console.error("Login error after registration:", error);
        return {
          error:
            "Account created but automatic login failed. Please log in manually.",
        };
      }
      // أي خطأ آخر غير متوقع
      console.error("Unexpected error during login:", error);
      return { error: "Something went wrong. Please try again." };
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;

    // إذا كان الخطأ من نوع AuthError (مثل فشل تسجيل الدخول)
    if (error instanceof AuthError) {
      console.error("Login error after registration:", error);
      return {
        error:
          "Account created but automatic login failed. Please log in manually.",
      };
    }

    // أي خطأ آخر (مشكلة في قاعدة البيانات إلخ)
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again" };
  }
}
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // محاولة تسجيل الدخول باستخدام نوع 'credentials'
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", // المكان الذي يذهب إليه المستخدم بعد النجاح
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error; // ضروري لكي يعمل نظام التوجيه (Redirect) في Next.js
  }
}

// export async function createProject(
//   prevState: any,
//   formData: FormData
// ): Promise<void | any> {
//   const session = await auth();
//   if (!session?.user?.id) return { error: "Unauthorized" };

//   // نكشة الـ SaaS: التحقق من عدد المشاريع الحالية
//   const projectCount = await db.project.count({
//     where: { userId: session.user.id },
//   });

//   const { isActive, plan } = await checkSubscription();

//   // تحديد الحد الأقصى حسب الخطة
//   let MAX_PROJECTS = 5; // Basic مجاني
//   if (plan === "PRO") MAX_PROJECTS = 100;
//   if (plan === "ENTERPRISE") MAX_PROJECTS = Infinity; // أو عدد كبير

//   if (projectCount >= MAX_PROJECTS) {
//     return { error: `You have reached the limit of ${MAX_PROJECTS} projects.` };
//   }

//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   if (!name || name.trim() === "") {
//     return { error: "Project name is required" };
//   }
export type ActionResponse = {
  success?: string;
  error?: string;
};
export async function createProject(
  prev: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth();

  // 1. التحقق من الهوية
  if (!session || !session.user) return { error: "Unauthorized" };

  try {
    // 2. التحقق من اشتراك المستخدم والليميت
    const { plan } = await checkSubscription();
    const projectCount = await db.project.count({
      where: { userId: session.user.id },
    });

    const limits: Record<string, number> = {
      BASIC: 5,
      PRO: 100,
      ENTERPRISE: Infinity,
    };

    const MAX_PROJECTS = limits[plan] || 5;

    if (projectCount >= MAX_PROJECTS) {
      return {
        error: `You have reached the limit of ${MAX_PROJECTS} projects`,
      };
    }

    // 3. استخراج البيانات والتحقق منها
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string)?.trim(); // تأكد إنها description بالـ e وليس الـ i

    if (!name || name.trim() === "") {
      return { error: "Project name is required" };
    }

    // 4. تنفيذ العملية داخل Transaction مع إرجاع النتيجة لحل مشكلة النوع (Type)
    const newProject = await db.$transaction(async (tx) => {
      // إنشاء المشروع
      const project = await tx.project.create({
        data: {
          name,
          description,
          userId: session.user.id,
        },
      });

      // إضافة المالك لجدول الأعضاء
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: session.user.id,
          role: "OWNER",
        },
      });

      return project; // نرجع المشروع عشان نستخدمه برا الترانزاكشن
    });

    // 5. إرسال الويب هوك خارج الترانزاكشن (أسرع وأضمن)
    if (newProject) {
      await dispatchWebhook(session.user.id, "project.created", {
        projectId: newProject.id,
        name: newProject.name,
        description: newProject.description ?? undefined,
      });
    }

    // 6. تحديث الصفحة والرد بالنجاح
    revalidatePath("/dashboard");
    return { success: "Project created!" };
  } catch (error) {
    console.error("CREATE_PROJECT_ERROR:", error);
    return { error: "Failed to create project. Please try again." };
  }
}
//   try {
//     const newProject = await db.project.create({
//       data: {
//         name,
//         description,
//         userId: session.user.id, // نربط المشروع بصاحب الجلسة الحالي
//       },
//     });

//     // داخل try block بعد إنشاء المشروع
//     await db.projectMember.create({
//       data: {
//         projectId: newProject.id,
//         userId: session.user.id,
//         role: "OWNER",
//       },
//     });
//     await dispatchWebhook(session.user.id, "project.created", {
//       projectId: newProject.id,
//       name: newProject.name,
//       description: newProject.description,
//     });

//     revalidatePath("/dashboard");
//     return { success: "Project created!" };
//   } catch (error) {
//     return { error: "Failed to create project" };
//   }
// }

export async function deleteProject(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projectId = formData.get("projectId") as string;
  const hasAccess = await hasProjectAccess(projectId, session.user.id, "OWNER");
  if (!hasAccess) {
    return { error: "Only the owner can delete this project" };
  }
  try {
    // نكشة الأمان: نحذف فقط إذا كان الـ userId يطابق صاحب الجلسة
    const deleted = await db.project.deleteMany({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) return { error: "Project not found or not yours" };

    // revalidatePath("/dashboard");
    return { success: "Project deleted!" };
  } catch (error) {
    return { error: "Failed to delete" };
  }
}

// أرشفة مشروع (بدلاً من حذفه)
export async function archiveProject(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const projectId = formData.get("projectId") as string;
  if (!projectId) {
    return { error: "Project ID is required" };
  }

  try {
    // التحقق من ملكية المشروع أو صلاحية EDITOR (حسب سياسة الوصول)
    const hasAccess = await hasProjectAccess(
      projectId,
      session.user.id,
      "EDITOR"
    );
    if (!hasAccess) {
      return { error: "You don't have permission to archive this project" };
    }

    // تحديث المشروع: تعيين archived = true
    await db.project.update({
      where: { id: projectId },
      data: { archived: true },
    });
    await dispatchWebhook(session.user.id, "project.archived", { projectId });
    revalidatePath("/dashboard");
    return { success: "Project archived successfully" };
  } catch (error) {
    console.error("Archive error:", error);
    return { error: "Failed to archive project" };
  }
}

// حذف نهائي لمشروع (يُستخدم فقط للمشاريع المؤرشفة)
export async function permanentDeleteProject(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const projectId = formData.get("projectId") as string;
  if (!projectId) {
    return { error: "Project ID is required" };
  }

  try {
    // التحقق من أن المستخدم هو OWNER (فقط المالك يمكنه الحذف النهائي)
    const hasAccess = await hasProjectAccess(
      projectId,
      session.user.id,
      "OWNER"
    );
    if (!hasAccess) {
      return { error: "Only the owner can permanently delete a project" };
    }

    // حذف المشروع وجميع علاقاته (بسبب onDelete: Cascade)
    await db.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/archive"); // إذا أضفنا صفحة أرشيف
    return { success: "Project permanently deleted" };
  } catch (error) {
    console.error("Permanent delete error:", error);
    return { error: "Failed to delete project" };
  }
}

// استعادة مشروع من الأرشيف
export async function restoreProject(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const projectId = formData.get("projectId") as string;
  if (!projectId) {
    return { error: "Project ID is required" };
  }

  try {
    const hasAccess = await hasProjectAccess(
      projectId,
      session.user.id,
      "EDITOR"
    );
    if (!hasAccess) {
      return { error: "You don't have permission to restore this project" };
    }

    await db.project.update({
      where: { id: projectId },
      data: { archived: false },
    });
    await dispatchWebhook(session.user.id, "project.restored", { projectId });
    revalidatePath("/dashboard");
    revalidatePath("/archive");
    return { success: "Project restored successfully" };
  } catch (error) {
    console.error("Restore error:", error);
    return { error: "Failed to restore project" };
  }
}

export async function toggleRole(userId: string): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authenticated" };
  }
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const user = await db.user.findFirst({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) return { error: "User not found" };

    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath("/admin");
    return { success: "success toggle" };
  } catch (error) {
    console.error("Error toggling role:", error);
    return { error: "Failed to update role" };
  }
}

export async function removeUser(userId: string): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  if (session?.user?.role !== "ADMIN") {
    return { error: "Forbidden: Admin access required" };
  }
  try {
    await db.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin");
    return { success: "user deleted" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

// ====================== تعديل المشروع ======================
export async function updateProject(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const projectId = formData.get("projectId") as string;

  const hasAccess = await hasProjectAccess(
    projectId,
    session.user.id,
    "EDITOR"
  );
  if (!hasAccess) {
    return { error: "You don't have permission to edit this project" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!projectId || !name) {
    return { error: "Project ID and name are required" };
  }

  try {
    // التأكد من أن المشروع يخص المستخدم الحالي
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return { error: "Project not found or not yours" };
    }

    // تحديث المشروع
    await db.project.update({
      where: { id: projectId },
      data: {
        name,
        description: description || null, // إذا كان الوصف فارغاً نخزنه null
      },
    });
    await dispatchWebhook(session.user.id, "project.updated", {
      projectId,
      name,
      description,
    });
    revalidatePath("/dashboard");
    return { success: "Project updated successfully!" };
  } catch (error) {
    console.error("Update project error:", error);
    return { error: "Failed to update project" };
  }
}

async function hasProjectAccess(
  projectId: string,
  userId: string,
  requiredRole: "VIEWER" | "EDITOR" | "OWNER" = "VIEWER"
) {
  const member = await db.projectMember.findFirst({
    where: {
      projectId,
      userId,
      role: {
        in:
          requiredRole === "VIEWER"
            ? ["VIEWER", "EDITOR", "OWNER"]
            : requiredRole === "EDITOR"
            ? ["EDITOR", "OWNER"]
            : ["OWNER"],
      },
    },
  });
  return !!member;
}
