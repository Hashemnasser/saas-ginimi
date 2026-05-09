import { db } from "@/lib/db";
import {
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendWelcomeEmail,
} from "@/lib/email"; // استيراد دوال الإيميل الجديدة
import { getPlanByPriceId } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PlanConfig } from "./../../../lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  console.log(`⏳ body:   ${body}`);

  const signature = req.headers.get("Stripe-Signature") as string;
  let event;
  console.log(`⏳ segnatur:   ${signature}`);

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
      600
    );
    console.log(`❌⏳main    ${event}`);
  } catch (error: any) {
    console.error(`❌ Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // التعامل مع نوع الحدث
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(session);
      console.log(`⏳U00 event type: ${event.type}`);

      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      console.log(`⏳1  event type: ${event.type}`);

      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      console.log(`⏳2 event type: ${event.type}`);

      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      console.log(`⏳3  event type: ${event.type}`);

      break;

    default:
      console.log(`⏳Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// دالة لمعرفة نوع الخطة

// function getPlanFromPriceId(priceId: string): "BASIC" | "PRO" | "ENTERPRISE" {
//   // هنا تكتب mapping بين price ID من Stripe والخطة
//   // مثال:
//   const priceToPlan: Record<string, "BASIC" | "PRO" | "ENTERPRISE"> = {
//     price_basic_123: "BASIC",
//     price_pro_456: "PRO",
//     price_enterprise_789: "ENTERPRISE",
//   };
//   return priceToPlan[priceId] || "BASIC";
// }
// دالة مساعدة للحدث checkout.session.completed (موجودة سابقاً)
async function handleCheckoutSessionCompleted(session: any) {
  try {
    const userId = session?.metadata?.userId;
    const subscriptionId = session.subscription;

    if (!userId) {
      console.error("⏳❌ User ID missing in checkout session");
      return;
    }

    const subscription = (await stripe.subscriptions.retrieve(
      subscriptionId
    )) as Stripe.Subscription;
    const existingUser = await db.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });
    console.log("Subscription object:", JSON.stringify(subscription, null, 2));
    if (existingUser) {
      console.log("⏳⚠️ Webhook already processed.");
      return;
    }

    // استخدام تاريخ الانتهاء الفعلي من Stripe بدلاً من futureDate
    const periodEnd = new Date(
      subscription.items.data[0].current_period_end * 1000
    );
    console.log("end period pro", periodEnd);

    // استدعاء دلة تحديد نوع الخطة

    // في handleCheckoutSessionCompleted
    const priceId = subscription.items.data[0].price.id;
    const plan = getPlanByPriceId(priceId);

    await db.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEnd,
        stripeSubscriptionStatus: true,
        plan: (plan?.name.toUpperCase() as PlanConfig["name"]) || "PRO", // افتراضياً Pro,
        stripeSubscriptionStart: new Date(), // تاريخ بدء الاشتراك
      },
    });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (user?.email && user?.name) {
      await sendWelcomeEmail(user.email, user.name);
    }

    revalidatePath("/dashboard");
    console.log("✅ Subscription activated for user:", userId);
  } catch (error: any) {
    console.error("❌ Error in handleCheckoutSessionCompleted:", error.message);
  }
}

// دالة جديدة للتعامل مع فشل الدفع
async function handleInvoicePaymentFailed(invoice: any) {
  console.log(
    "❌⏳❌⏳❌⏳⚠️ ❌⏳❌⏳❌⏳⚠️❌⏳❌⏳❌⏳⚠️❌⏳❌⏳❌⏳⚠️❌⏳❌⏳❌⏳⚠️No subscription ID in invoice"
  );

  try {
    // نجلب رقم الاشتراك من الفاتورة
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) {
      console.log("❌⏳❌⏳❌⏳⚠️ No subscription ID in invoice");
      return;
    }

    // نجلب المستخدم من قاعدة البيانات باستخدام stripeSubscriptionId
    const user = await db.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      console.log("⚠️ No user found for subscription:", subscriptionId);
      return;
    }

    // نحدث حالة الاشتراك إلى past_due (false) مع الإبقاء على المعرفات
    await db.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: false, // صار غير نشط
      },
    });

    // نرسل إيميل للمستخدم يخبره بمشكلة الدفع
    if (user.email) {
      await sendPaymentFailedEmail(user.email, user.name || "User");
    }

    console.log(
      "⚠️❌⏳❌⏳❌⏳❌⏳❌⏳❌⏳❌⏳❌⏳❌⏳ Payment failed for user:",
      user.email
    );
  } catch (error: any) {
    console.error("❌ Error in handleInvoicePaymentFailed:", error.message);
  }
}

// دالة جديدة للتعامل مع تحديثات الاشتراك (مثل إلغاء في نهاية الفترة)
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const subscriptionId = subscription.id;
    const customerId = subscription.customer;
    console.log("⚠️⚠️⚠️⚠️<><><><>⚠️⚠️⚠️⚠️⚠️", subscription);
    // نجلب المستخدم
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      console.log("⚠️ No user found for subscription update:", subscriptionId);
      return;
    }

    // نتحقق من حالة الاشتراك الجديدة
    const status = subscription.status; // 'active', 'past_due', 'canceled', 'incomplete', إلخ
    const cancelAtPeriodEnd = subscription.cancel_at_period_end; // true إذا ألغى المستخدم
    //subscription.items.data[0].cancel_at_period_end * 1000

    // نحدث تاريخ الانتهاء (قد يتغير إذا جدد الاشتراك)
    const periodEnd = new Date(
      subscription.items.data[0].current_period_end * 1000
    );

    // نحدد القيمة الجديدة للحقل stripeSubscriptionStatus
    // الاشتراك نشط فقط إذا كانت الحالة 'active' والمستخدم لم يلغِ في نهاية الفترة
    // (إذا ألغى، يبقى active حتى نهاية الفترة ثم نحذف)
    let isActive = status === "active" && !cancelAtPeriodEnd;
    console.log("⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ ", isActive);
    await db.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: isActive,
        stripeCurrentPeriodEnd: periodEnd,
        // إذا ألغى المستخدم، لا نمسح المعرفات حتى نهاية الفترة
      },
    });

    // إذا ألغى المستخدم (cancelAtPeriodEnd = true) نرسل إيميل تأكيد الإلغاء
    if (cancelAtPeriodEnd && user.email) {
      await sendSubscriptionCancelledEmail(user.email, user.name || "User");
    }

    console.log(
      `🔄 Subscription updated for user: ${user.email}, active: ${isActive}, cancel at period end: ${cancelAtPeriodEnd}`
    );
  } catch (error: any) {
    console.error("❌ Error in handleSubscriptionUpdated:", error.message);
  }
}

// دالة جديدة للتعامل مع حذف الاشتراك (عند الإلغاء الفوري أو بعد انتهاء الفترة)
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const subscriptionId = subscription.id;

    const user = await db.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      console.log(
        "⚠️ No user found for subscription deletion:",
        subscriptionId
      );
      return;
    }

    // نمسح جميع بيانات الاشتراك أو نجعل الحالة false
    await db.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: false,
        // يمكنك إما ترك المعرفات أو مسحها، الأفضل تركها مع الحالة false للتاريخ
      },
    });

    console.log("🗑️ Subscription deleted for user:", user.email);
  } catch (error: any) {
    console.error("❌ Error in handleSubscriptionDeleted:", error.message);
  }
}
