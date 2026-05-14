import { db } from "@/lib/db";
import {
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { getPlanByPriceId } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { Plan } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  console.time("webhook"); // بدأ计时
  // التحقق من التوقيع (signature)...

  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
      600
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Webhook signature verification failed: ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // التعامل مع نوع الحدث باستخدام Type Casting آمن
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    default:
      console.log(`⏳ Unhandled event type: ${event.type}`);
  }

  console.timeEnd("webhook"); // خلص计时 للويب هوك كله

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.time("db-query"); // بدأ计时 للاستعلام
  // استعلام قاعدة البيانات...

  try {
    const userId = session?.metadata?.userId;
    const subscriptionId = session.subscription as string;

    if (!userId) {
      console.error("⏳❌ User ID missing in checkout session metadata");
      return;
    }

    // جلب الاشتراك كامل لضمان وجود التواريخ
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // التحقق من المستخدم باستخدام الـ ID اللي جاي من الميتادات وليس السبسكريبشن آيدي
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.error("❌ User not found in database:", userId);
      return;
    }

    // إذا كان المستخدم أصلاً مفعل، ما في داعي نعيد العملية (Idempotency)
    if (user.stripeSubscriptionStatus) {
      console.log("⏳⚠️ Webhook already processed for this user.");
      return;
    }

    const firstItem = subscription.items.data[0];
    const periodEndUnix = firstItem.current_period_end;
    const periodEndDate = new Date(periodEndUnix * 1000);
    console.log("📅 Period End captured successfully:", periodEndDate);
    const priceId = subscription.items.data[0].price.id;
    const plan = getPlanByPriceId(priceId);

    // التحديث باستخدام userId
    await db.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEndDate,
        stripeSubscriptionStatus: true,
        plan: (plan?.name.toUpperCase() as Plan) || "PRO",
        stripeSubscriptionStart: new Date(),
      },
    });

    if (user.email) {
      await sendWelcomeEmail(user.email, user.name || "User");
    }

    // مهم جداً لتحديث الكاش في Next.js
    revalidatePath("/dashboard");
    console.log("✅ Subscription activated for user:", userId);
    console.timeEnd("db-query"); // خلص计时 للاستعلا
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in handleCheckoutSessionCompleted:", errorMessage);
  }
}

// async function handleCheckoutSessionCompleted(
//   session: Stripe.Checkout.Session
// ) {
//   try {
//     const userId = session?.metadata?.userId;
//     const subscriptionId = session.subscription as string;

//     if (!userId) {
//       console.error("⏳❌ User ID missing in checkout session metadata");
//       return;
//     }

//     const subscription = (await stripe.subscriptions.retrieve(
//       subscriptionId
//     )) as Stripe.Subscription & { current_period_end?: number };

//     const existingUser = await db.user.findFirst({
//       where: { stripeSubscriptionId: subscriptionId },
//     });

//     if (existingUser?.stripeSubscriptionStatus) {
//       console.log("⏳⚠️ Webhook already processed or user already active.");
//       return;
//     }
//     console.log(
//       "⏳⚠️subscription.current_period_end ",
//       subscription.current_period_end
//     );

//     // تأكد إن القيمة موجودة قبل ما تضربها بـ 1000
//     // 1. حول الـ subscription لـ Stripe.Subscription عشان تقدر تقرأ اللي جواه

//     // 2. هلق صار فيك تقرأ الـ current_period_end بأمان
//     const periodEnd = subscription.current_period_end
//       ? new Date(subscription.current_period_end * 1000)
//       : null;
//     console.log("⏳⚠️333periodEnd", periodEnd);

//     const priceId = subscription.items.data[0].price.id;
//     const plan = getPlanByPriceId(priceId);

//     await db.user.update({
//       where: { id: userId },
//       data: {
//         stripeSubscriptionId: subscription.id,
//         stripeCustomerId: subscription.customer as string,
//         stripePriceId: priceId,
//         stripeCurrentPeriodEnd: periodEnd,
//         stripeSubscriptionStatus: true,
//         plan: (plan?.name.toUpperCase() as PlanConfig["name"]) || "PRO",
//         stripeSubscriptionStart: new Date(),
//       },
//     });

//     const user = await db.user.findUnique({ where: { id: userId } });
//     if (user?.email) {
//       await sendWelcomeEmail(user.email, user.name || "User");
//     }

//     revalidatePath("/dashboard");
//     console.log("✅ Subscription activated for user:", userId);
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     console.error("❌ Error in handleCheckoutSessionCompleted:", errorMessage);
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice & { subscription?: string | null }
) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const user = await db.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true, email: true, name: true },
    });

    if (!user) return;

    await db.user.update({
      where: { id: user.id },
      data: { stripeSubscriptionStatus: false },
    });

    if (user.email) {
      await sendPaymentFailedEmail(user.email, user.name || "User");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in handleInvoicePaymentFailed:", errorMessage);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true, name: true },
    });

    if (!user) return;

    const status = subscription.status;

    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    const periodEndTimestamp = subscription.items.data[0].current_period_end;
    const isActive = status === "active" && !cancelAtPeriodEnd;
    const periodEnd = new Date(periodEndTimestamp * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: isActive,
        stripeCurrentPeriodEnd: periodEnd,
      },
    });

    if (cancelAtPeriodEnd && user.email) {
      await sendSubscriptionCancelledEmail(user.email, user.name || "User");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in handleSubscriptionUpdated:", errorMessage);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const user = await db.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { id: true, email: true },
    });

    if (!user) return;

    await db.user.update({
      where: { id: user.id },
      data: { stripeSubscriptionStatus: false },
    });

    console.log("🗑️ Subscription deleted for user:", user.email);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in handleSubscriptionDeleted:", errorMessage);
  }
}
