// app/checkout/processing/ProcessingContent.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ProcessingContent() {
  const router = useRouter();
  const { update } = useSession();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  console.log("⏳ 8", sessionId);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (!sessionId) return;

    const check = async () => {
      const res = await fetch("/api/check-sub");
      const data = await res.json();
      console.log("⏳9 ", data);

      if (data.isPro) {
        await update();
        router.push("/dashboard");
      } else {
        setTimeout(check, 2000);
      }
    };

    check();
  }, [router, update, sessionId]);

  if (!sessionId) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-lg font-medium">
        جاري تأكيد اشتراكك، لحظات من فضلك...
      </p>
    </div>
  );
}
