// app/checkout/processing/ProcessingContent.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("فشل جلب البيانات");
    return res.json();
  }); //   or we can write  const  fetcher = async(url:string)=>{const res=await fetch(url) return res.json() }
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

  // استخدم الـ sessionId كمرجع وحيد، الـ refreshInterval لحاله رح يخلي الطلب يتحدث
  // const { data } = useSWR(
  //   // sessionId ?
  //   `/api/check-sub`,
  //   fetcher,
  //   {
  //     refreshInterval: 2000,
  //     // revalidateOnFocus: true,
  //     // dedupingInterval: 0, // هاد السطر بيضمن إنه ما يعتمد على الكاش القديم
  //   }
  // );

  const { data, error, isLoading } = useSWR(
    `/api/check-sub`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    {
      refreshInterval: 2000,
      onError: (error) => console.error("SWR Error:", error),
      fallbackData: { name: "Loading..." },
    }
  );
  console.log("⏳ data.isPro", data?.isPro);
  useEffect(() => {
    if (data?.isPro) {
      (async () => {
        try {
          await update();
          router.push("/dashboard");
        } catch (err) {
          console.error("فشل تحديث الجلسة:", err);
        }
      })(); //" async لا يقبل useEffect   "  لان  "async"حركة احترافية لاستدعاء الدالة المعلنة فورا ونحن اضطررنا لعمل دالة لاستخدام
    }
  }, [data, router, update]);
  if (!sessionId) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4">
        {isLoading && <p>Loading ... ... ...</p>}{" "}
      </div>
      <p className="text-lg font-medium">
        جاري تأكيد اشتراكك، لحظات من فضلك...
      </p>
      <p>{error}</p>
    </div>
  );
}
