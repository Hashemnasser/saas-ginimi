import { auth } from "@/auth"; // استدعاء الدالة المركزية لـ Auth v5
import { db } from "@/lib/db";

/**
 * دالة التحقق من الاشتراك باستخدام Auth v5
 */
export const checkSubscription = async () => {
  // جلب الجلسة مباشرة من السيرفر
  const session = await auth();

  if (!session?.user?.email) {
    return false;
  }

  // البحث عن المستخدم في Neon
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!user) return false;

  // فحص صلاحية الاشتراك
  const isValid =
    user.stripeSubscriptionId &&
    user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() > Date.now();

  return !!isValid;
};
