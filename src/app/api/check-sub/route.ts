import { checkSubscription } from "@/lib/subscription"; // تأكد من المسار الصحيح لدالتك
import { NextResponse } from "next/server";

export async function GET() {
  // استدعاء دالتك التي كتبتها أنت
  console.log("⏳ 100");

  const { isActive } = await checkSubscription();
  console.log("⏳ 10", isActive);

  return NextResponse.json(
    { isPro: isActive }
    // {
    //   headers: {
    //     "Cache-Control": "no-cache, no-store, must-revalidate",   //منع التخزين للمتصفحات الحديثة
    //     Pragma: "no-cache",   // منع التخزين للمتصفحات القديمة
    //     Expires: "0",
    //   },
    // }
  );
}
