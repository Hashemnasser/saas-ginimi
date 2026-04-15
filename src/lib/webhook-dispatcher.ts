import crypto from "crypto";
import { db } from "./db";

// سر التوقيع (يجب أن يكون في متغيرات البيئة)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default-secret-change-me";

/**
 * إرسال webhook إلى جميع المشتركين في حدث معين
 * @param userId - معرف المستخدم الذي حدث لديه الحدث
 * @param event - اسم الحدث (مثل "project.created")
 * @param payload - البيانات المرسلة (ستُحول إلى JSON)
 */
export async function dispatchWebhook(
  userId: string,
  event: string,
  payload: any
) {
  // 1. جلب جميع الاشتراكات النشطة للمستخدم التي تحتوي على هذا الحدث
  const subscriptions = await db.webhookSubscription.findMany({
    where: {
      userId,
      active: true,
      events: { has: event },
    },
  });

  if (subscriptions.length === 0) return;

  // 2. تجهيز جسم الطلب
  const body = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };
  const bodyString = JSON.stringify(body);

  // 3. حساب التوقيع (HMAC-SHA256)
  const signature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(bodyString)
    .digest("hex");

  // 4. إرسال الطلب لكل اشتراك (غير متزامن، لا ننتظر النتيجة)
  for (const sub of subscriptions) {
    fetch(sub.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature, // نرسل التوقيع في header
      },
      body: bodyString,
    }).catch((err) => {
      // تسجيل الخطأ ولكن لا نوقف العملية
      console.error(`Failed to deliver webhook to ${sub.url}:`, err.message);
    });
  }
}
