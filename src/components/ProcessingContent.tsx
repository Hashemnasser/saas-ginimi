"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

// تعريف fetcher خارج المكون لتجنب إعادة إنشائه
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch subscription status");
  return res.json();
};

export default function ProcessingContent() {
  const router = useRouter();
  const { update } = useSession();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // التحقق المبكر من وجود sessionId
  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
    }
  }, [sessionId, router]);

  // جلب حالة الاشتراك كل 2 ثانية
  const { data, error, isLoading } = useSWR(
    sessionId ? "/api/check-sub" : null, // لا تجلب إذا لم يوجد sessionId
    fetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      dedupingInterval: 0,
    }
  );

  // عند نجاح الاشتراك، تحديث الجلسة والتوجيه
  useEffect(() => {
    if (data?.isPro) {
      const finalize = async () => {
        await update();
        router.push("/dashboard");
      };
      finalize();
    }
  }, [data, router, update]);

  // إذا لم يوجد sessionId، لا نعرض شيئًا (سيتم التوجيه فورًا)
  if (!sessionId) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-lg font-medium text-gray-700">
        جاري تأكيد اشتراكك، لحظات من فضلك...
      </p>
      {isLoading && (
        <p className="text-sm text-gray-500 mt-2">جاري التحقق...</p>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-4">
          حدث خطأ في التحقق من الاشتراك. يرجى تحديث الصفحة أو مراجعة الدعم.
        </p>
      )}
    </div>
  );
}
