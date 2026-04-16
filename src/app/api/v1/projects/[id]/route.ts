import { verifyApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const project = await db.project.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { name, description } = body;
  // التحقق من وجود المشروع وملكيته
  const existing = await db.project.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  // بناء كائن التحديث بنوع صريح
  const updateData: Prisma.ProjectUpdateInput = {};
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
    updateData.description = description?.trim() ?? null;
  }
  const updatedProject = await db.project.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ project: updatedProject });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await db.project.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  await db.project.update({
    where: { id },
    data: { archived: true },
  });
  return NextResponse.json({ success: true, message: "Project archived" });
}
