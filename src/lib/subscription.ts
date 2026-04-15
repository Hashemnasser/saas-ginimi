import { auth } from "@/auth";
import { db } from "./db";

export const checkSubscription = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    return { isActive: false, plan: "BASIC" };
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      stripeSubscriptionStatus: true,
      stripeCurrentPeriodEnd: true,
      plan: true,
    },
  });

  if (!user) return { isActive: false, plan: "BASIC" };

  const isActive =
    user.stripeSubscriptionStatus === true &&
    (user?.stripeCurrentPeriodEnd?.getTime() || 0) > Date.now();

  return {
    isActive,
    plan: user.plan,
  };
};
