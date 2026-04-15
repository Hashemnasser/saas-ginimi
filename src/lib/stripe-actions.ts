"use server";

import { stripe } from "@/lib/stripe";
import { db } from "./db";
import { checkSubscription } from "./subscription";

export const createCheckoutSession = async (
  userId: string,
  priceId: string
) => {
  if (!userId || !priceId) {
    throw new Error("User ID and Price ID are required");
  }

  const { isActive } = await checkSubscription();
  if (isActive) {
    const portalSession = await createCustomerPortalSession(userId);
    return { url: portalSession.url };
  }

  const session = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/processing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId },
  });

  return { url: session.url };
};
// lib/stripe-actions.ts (نفس الملف)

const createCustomerPortalSession = async (userId: string) => {
  // 1. نجلب المستخدم من قاعدة البيانات للحصول على stripeCustomerId
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No customer ID found for this user");
  }

  // 2. إنشاء جلسة بوابة العملاء
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, // أين يعود المستخدم بعد مغادرة البوابة
  });

  return { url: portalSession.url };
};
