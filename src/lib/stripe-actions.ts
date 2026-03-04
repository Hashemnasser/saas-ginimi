"use server";

import { stripe } from "@/lib/stripe";

export const createCheckoutSession = async (userId: string) => {
  // تأكد أن الـ ID ليس فارغاً قبل البدء
  if (!userId) {
    throw new Error("User ID is required to create a session");
  }

  const session = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/processing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    payment_method_types: ["card"],
    mode: "subscription",
    billing_address_collection: "auto", // إضافة اختيارية لتحسين تجربة المستخدم
    line_items: [
      {
        price_data: {
          currency: "USD",
          product_data: {
            name: "Pro Plan",
            description: "Unlimited Access to all features",
          },
          unit_amount: 2000, // 20.00 USD
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    // 🔥 هذا هو الرابط الذي سيقرأه ملف الـ Webhook
    metadata: {
      userId: userId,
    },
  });

  return { url: session.url };
};
