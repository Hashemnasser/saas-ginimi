"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ProcessingPage() {
  const router = useRouter();
  const { update } = useSession();
  const searchParams = useSearchParams();

  // جلب الـ session_id من الرابط
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // إذا دخل المستخدم الصفحة بدون الـ ID الخاص بسترايب
    if (!sessionId) {
      router.replace("/"); // طرده فوراً للصفحة الرئيسية
    }
  }, [sessionId, router]);

  if (!sessionId) return null; // لا تعرض شيئاً حتى يتم التحويل
  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/check-sub");
      const data = await res.json();

      if (data.isPro) {
        // تحديث السيشن عشان الأزرار تختفي فوراً
        await update();
        // التوجه للوحة التحكم
        router.push("/dashboard");
      } else {
        // إعادة المحاولة بعد ثانيتين إذا لم يصبح برو بعد
        setTimeout(check, 2000);
      }
    };

    check();
  }, [router, update]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-lg font-medium">
        جاري تأكيد اشتراكك، لحظات من فضلك...
      </p>
    </div>
  );
}
