"use server";

import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const newName = formData.get("name") as string;

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

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    // 1. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user in Neon
    await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return { success: "Account created successfully" };
  } catch (error) {
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
      redirectTo: "/", // المكان الذي يذهب إليه المستخدم بعد النجاح
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

export async function createProject(
  prevState: any,
  formData: FormData
): Promise<void | any> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  // نكشة الـ SaaS: التحقق من عدد المشاريع الحالية
  const projectCount = await db.project.count({
    where: { userId: session.user.id },
  });

  const MAX_FREE_PROJECTS = 5; // سقف الخطة المجانية

  if (projectCount >= MAX_FREE_PROJECTS) {
    return {
      error: `You have reached the limit of ${MAX_FREE_PROJECTS} projects. Please upgrade to Pro.`,
    };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  try {
    await db.project.create({
      data: {
        name,
        description,
        userId: session.user.id, // نربط المشروع بصاحب الجلسة الحالي
      },
    });
    revalidatePath("/dashboard");
    return { success: "Project created!" };
  } catch (error) {
    return { error: "Failed to create project" };
  }
}

export async function deleteProject(
  prevState: any,
  formData: FormData
): Promise<void | any> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projectId = formData.get("projectId") as string;

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




export async function toggleRole(userId: string, currentRole: string) {
  const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
  await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
  revalidatePath("/admin");
}

export async function removeUser(userId: string) {
  await db.user.delete({
    where: { id: userId },
  });
  revalidatePath("/admin");
}