// استيراد مكتبة Resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Thank you for subscribing to Pro Plan!",
      html: `
        <h1>Hello ${name}!</h1>
        <p>Thank you for subscribing to our Pro plan. You now have unlimited access to all features.</p>
        <p>If you have any questions, feel free to contact us.</p>
      `,
    });
    console.log("✅ Welcome email sent to", email);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
  }
}

// دالة جديدة لإرسال إيميل فشل الدفع
export async function sendPaymentFailedEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Payment Failed - Update Your Payment Method",
      html: `
        <h1>Hello ${name}!</h1>
        <p>We were unable to process your latest subscription payment.</p>
        <p>Please update your payment method to continue enjoying Pro features.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Click here to update your payment method</a></p>
      `,
    });
    console.log("⚠️ Payment failed email sent to", email);
  } catch (error) {
    console.error("❌ Failed to send payment failed email:", error);
  }
}

// دالة جديدة لإرسال إيميل تأكيد إلغاء الاشتراك
export async function sendSubscriptionCancelledEmail(
  email: string,
  name: string
) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your Pro Subscription Has Been Cancelled",
      html: `
        <h1>Hello ${name}!</h1>
        <p>Your Pro subscription has been cancelled. You will continue to have access until the end of your current billing period.</p>
        <p>We're sorry to see you go. If you change your mind, you can resubscribe anytime.</p>
      `,
    });
    console.log("🗑️ Cancellation email sent to", email);
  } catch (error) {
    console.error("❌ Failed to send cancellation email:", error);
  }
}

// دالة لإرسال إيميل تذكير باقتراب انتهاء الاشتراك
export async function sendRenewalReminderEmail(
  email: string,
  name: string,
  daysLeft: number
) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your subscription is about to expire",
      html: `
        <h1>Hello ${name}!</h1>
        <p>Your Pro subscription will expire in ${daysLeft} days.</p>
        <p>Please renew to continue enjoying unlimited access.</p>
      `,
    });
    console.log("✅ Renewal reminder sent to", email);
  } catch (error) {
    console.error("❌ Failed to send renewal reminder:", error);
  }
}
