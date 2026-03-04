import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string; // التوقيع الأمني
  let event;

  try {
    // التحقق من أن الطلب قادم من سترايب فعلاً
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET! // تأكد من إضافة هذا في ملف .env
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    try {
      const userId = session?.metadata?.userId;
      // 1. جلب رقم الاشتراك من سترايب

      const subscriptionId = session.subscription;

      if (!userId) {
        return new NextResponse("User ID missing", { status: 400 });
      }

      // جلب بيانات الاشتراك من سترايب
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      console.log("⏳ تحديث قاعدة البيانات للمستخدم:", userId);

      // 2. فحص هل هذا الاشتراك مسجل لدينا مسبقاً؟
      const existingUser = await db.user.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      // 3. إذا كان موجوداً، نتوقف فوراً (Idempotency)
      if (existingUser) {
        console.log("⚠️ هذا الـ Webhook تمت معالجته مسبقاً.");
        return new NextResponse("Success", { status: 200 }); // نخبر سترايب أن كل شيء تمام
      }

      // الحل القاضي: نحسب التاريخ يدوياً لنتجنب Invalid Date نهائياً
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1); // إضافة شهر من تاريخ اليوم

      await db.user.update({
        where: { id: userId },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: futureDate, // تاريخ مضمون ومحسوب برمجياً
        },
      });
      // هذا السطر يخبر Next.js بمسح "الكاش" لصفحة معينة وتحديثها فوراً
      revalidatePath("/dashboard");
      console.log("✅ مبروك! تم التحديث بنجاح وقاعدة البيانات الآن Pro.");
      return new NextResponse("Success", { status: 200 });
    } catch (dbError: any) {
      console.error("❌ خطأ Prisma:", dbError.message);
      return new NextResponse(`Error: ${dbError.message}`, { status: 400 });
    }
  }

  return new NextResponse("Event Received", { status: 200 });
}
