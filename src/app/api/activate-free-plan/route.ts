import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.user.update({
      where: { id: userId },
      data: {
        plan: "BASIC",
        stripeSubscriptionStatus: false, // ليس اشتراكاً مدفوعاً
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error activating free plan:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
