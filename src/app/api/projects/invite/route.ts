import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, email, role } = await req.json();
    if (!projectId || !email || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // التحقق من أن المستخدم الحالي هو مالك المشروع
    const member = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
        role: "OWNER",
      },
    });
    if (!member) {
      return NextResponse.json(
        { error: "Only the owner can invite members" },
        { status: 403 }
      );
    }

    // البحث عن المستخدم المدعو
    const invitedUser = await db.user.findUnique({
      where: { email },
    });
    if (!invitedUser) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    // التحقق من أنه ليس عضواً بالفعل
    const existing = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: invitedUser.id,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 }
      );
    }

    // إضافة العضو
    const newMember = await db.projectMember.create({
      data: {
        projectId,
        userId: invitedUser.id,
        role: role === "EDITOR" ? "EDITOR" : "VIEWER",
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ success: true, newMember });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
