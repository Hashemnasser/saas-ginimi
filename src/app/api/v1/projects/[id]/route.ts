import { verifyApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. التحقق من المفتاح
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;

  // 2. جلب المشروع والتأكد أنه يخص المستخدم
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      userId: auth.userId,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // 3. إرجاع المشروع
  return NextResponse.json({ project });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description } = body;

  // التحقق من وجود المشروع وملكيته
  const existing = await db.project.findFirst({
    where: { id: projectId, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // تجهيز البيانات الجديدة (فقط الحقول التي تم إرسالها)
  const updateData: any = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 }
      );
    }
    updateData.name = name.trim();
  }
  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  // تنفيذ التحديث
  const updatedProject = await db.project.update({
    where: { id: projectId },
    data: updateData,
  });

  return NextResponse.json({ project: updatedProject });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;

  // التحقق من وجود المشروع وملكيته
  const existing = await db.project.findFirst({
    where: { id: projectId, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // نقوم بالأرشفة بدلاً من الحذف الفعلي
  await db.project.update({
    where: { id: projectId },
    data: { archived: true },
  });

  return NextResponse.json({ success: true, message: "Project archived" });
}
