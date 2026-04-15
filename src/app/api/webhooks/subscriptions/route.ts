import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: جلب جميع اشتراكات المستخدم الحالي
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await db.webhookSubscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscriptions });
}

// POST: إضافة اشتراك جديد
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { url, events } = body;

  // التحقق من صحة البيانات
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }
  if (!events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json(
      { error: "At least one event is required" },
      { status: 400 }
    );
  }

  // قائمة الأحداث المسموح بها (لأمان)
  const allowedEvents = [
    "project.created",
    "project.updated",
    "project.archived",
    "project.restored",
  ];
  const invalidEvents = events.filter(
    (e: string) => !allowedEvents.includes(e)
  );
  if (invalidEvents.length > 0) {
    return NextResponse.json(
      { error: `Invalid events: ${invalidEvents.join(", ")}` },
      { status: 400 }
    );
  }

  // التحقق من أن الـ URL يبدأ بـ http:// أو https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "URL must start with http:// or https://" },
      { status: 400 }
    );
  }

  try {
    const subscription = await db.webhookSubscription.create({
      data: {
        userId: session.user.id,
        url,
        events,
        active: true,
      },
    });
    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error: any) {
    // خطأ التكرار (unique constraint)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You already have a subscription with this URL" },
        { status: 409 }
      );
    }
    console.error("Error creating webhook subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: حذف اشتراك (نستخدم معرف الاشتراك في جسم الطلب أو في query)
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json(
      { error: "Subscription ID is required" },
      { status: 400 }
    );
  }

  // التأكد من أن الاشتراك يخص المستخدم الحالي
  const subscription = await db.webhookSubscription.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!subscription) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 }
    );
  }

  await db.webhookSubscription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
