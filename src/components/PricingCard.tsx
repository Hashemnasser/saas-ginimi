"use client";

import { createCheckoutSession } from "@/lib/stripe-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PricingCard({
  plan,
  userId,
}: {
  plan:
    | {
        priceId: null;
        name: string;
        description: string;
        price: number;
        interval: "month" | "year";
        projectLimit: number | "unlimited";
      }
    | {
        priceId: string;
        name: string;
        description: string;
        price: number;
        interval: "month" | "year";
        projectLimit: number | "unlimited";
      };
  userId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChoosePlan = async () => {
    if (!userId) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    setLoading(true);

    // إذا كانت الخطة مجانية (Basic)
    if (plan.price === 0) {
      // هنا نحدث خطة المستخدم مباشرة في قاعدة البيانات إلى BASIC
      // نحتاج دالة Server Action للتحديث
      try {
        const response = await fetch("/api/activate-free-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (response.ok) {
          toast.success("Basic plan activated!");
          router.refresh();
        } else {
          toast.error("Failed to activate plan");
        }
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
      return;
    }

    // للخطط المدفوعة
    try {
      const { url } = await createCheckoutSession(
        userId,
        plan.priceId as string
      );
      window.location.href = url as string; //  رابط الانتقال الى سترايب للدفع   وهو رابط خارجي لذا استخدمنا هذا الكود وليس اليوزراوتر
    } catch (error) {
      toast.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold">{plan.name}</h2>
      <p className="text-gray-600 dark:text-gray-100 mt-2">
        {plan.description}
      </p>
      <p className="text-3xl font-bold mt-4">
        {plan.price === 0 ? "Free" : `$${plan.price / 100}`}
        {plan.price > 0 && (
          <span className="text-sm font-normal">/{plan.interval}</span>
        )}
      </p>
      <p className="text-gray-600 dark:text-gray-100 mt-2">
        Projects:{" "}
        {plan.projectLimit === "unlimited" ? "Unlimited" : plan.projectLimit}
      </p>
      <button
        onClick={handleChoosePlan}
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Loading..." : "Choose Plan"}
      </button>
    </div>
  );
}
