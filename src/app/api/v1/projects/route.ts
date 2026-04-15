import { verifyApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 1. التحقق من صحة المفتاح
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. جلب المشاريع الخاصة بالمستخدم (غير المؤرشفة)
  const projects = await db.project.findMany({
    where: {
      userId: auth.userId,
      archived: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 3. إعادة النتيجة كـ JSON
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  // 1. التحقق من المفتاح
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. قراءة البيانات من جسم الطلب (JSON)
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description } = body;

  // 3. التحقق من صحة البيانات
  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json(
      { error: "Project name is required" },
      { status: 400 }
    );
  }

  // 4. (اختياري) التحقق من حدود الخطة (مثل عدد المشاريع المسموح بها للمستخدم)
  //    يمكنك استدعاء checkSubscription أو حساب عدد المشاريع الحالية
  const projectCount = await db.project.count({
    where: { userId: auth.userId, archived: false },
  });
  // نحتاج إلى معرف خطة المستخدم (Basic, Pro, Enterprise) من قاعدة البيانات
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { plan: true },
  });
  let maxProjects = 5; // Basic
  if (user?.plan === "PRO") maxProjects = Infinity;
  if (user?.plan === "ENTERPRISE") maxProjects = Infinity;
  if (projectCount >= maxProjects) {
    return NextResponse.json(
      {
        error: `Project limit reached (${maxProjects} max). Upgrade your plan.`,
      },
      { status: 403 }
    );
  }

  // 5. إنشاء المشروع في قاعدة البيانات
  const newProject = await db.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      userId: auth.userId,
    },
  });

  // 6. إرجاع المشروع الذي تم إنشاؤه (مع status 201 Created)
  return NextResponse.json({ project: newProject }, { status: 201 });
}
