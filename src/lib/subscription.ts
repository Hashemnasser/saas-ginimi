import { auth } from "@/auth";
import { db } from "./db";

export const checkSubscription = async () => {
  const session = await auth();
  console.log("⏳9911 ", session?.user.email);

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
  console.log("⏳9900user", user);
  if (!user) return { isActive: false, plan: "BASIC" };

  const isActive =
    user.stripeSubscriptionStatus === true &&
    (user?.stripeCurrentPeriodEnd?.getTime() || 0) > Date.now();
  console.log("⏳99 ", isActive);
  console.log(
    "⏳stripeCurrentPeriodEnd",
    (user?.stripeCurrentPeriodEnd?.getTime() || 0) > Date.now()
  );

  return {
    isActive,
    plan: user.plan,
  };
};
