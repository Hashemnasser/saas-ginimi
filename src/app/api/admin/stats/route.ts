import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  try {
    // 1. التحقق من صلاحيات المشرف
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. إحصائيات من قاعدة البيانات
    const userCount = await db.user.count();
    const projectCount = await db.project.count();
    const activeSubscriptionsFromDb = await db.user.count({
      where: { stripeSubscriptionStatus: true },
    });

    // 3. إحصائيات من Stripe (MRR)
    let mrr = 0;
    let activeSubscriptionsFromStripe = 0;
    try {
      // جلب جميع الاشتراكات النشطة من Stripe (paginated)
      let hasMore = true;
      let startingAfter: string | undefined = undefined;
      while (hasMore) {
        const subscriptions: Stripe.ApiList<Stripe.Subscription> =
          await stripe.subscriptions.list({
            status: "active",
            limit: 100,
            starting_after: startingAfter,
          });
        for (const sub of subscriptions.data) {
          // لكل اشتراك، نجلب السعر من أول عنصر في items
          const price = sub.items.data[0]?.price;
          if (price && price.unit_amount) {
            let monthlyAmount = price.unit_amount; // بالسنت
            // إذا كان الاشتراك سنويًا، نقسم على 12
            if (price.recurring?.interval === "year") {
              monthlyAmount = Math.floor(monthlyAmount / 12);
            }
            mrr += monthlyAmount;
            activeSubscriptionsFromStripe++;
          }
        }
        hasMore = subscriptions.has_more;
        startingAfter = subscriptions.data[subscriptions.data.length - 1]?.id;
      }
    } catch (stripeError) {
      console.error("Stripe MRR fetch error:", stripeError);
      // نستمر بدون MRR إذا فشل Stripe
    }

    return NextResponse.json({
      userCount,
      projectCount,
      activeSubscriptions: activeSubscriptionsFromDb, // أو activeSubscriptionsFromStripe
      mrr: mrr / 100, // تحويل من سنت إلى دولار
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
