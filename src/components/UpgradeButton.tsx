"use client";

import { createCheckoutSession } from "@/lib/stripe-actions";
import { useState } from "react";

export default function UpgradeButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const { url } = await createCheckoutSession(userId);
      if (url) window.location.href = url;
    } catch (error) {
      console.error("فشل في توجيهك لصفحة الدفع:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
    >
      {isLoading ? " loading..." : "upgrade to Pro"}
    </button>
  );
}
