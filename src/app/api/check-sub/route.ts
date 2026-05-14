import { checkSubscription } from "@/lib/subscription"; // تأكد من المسار الصحيح لدالتك
import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

export async function GET() {
  // استدعاء دالتك التي كتبتها أنت
  console.log("⏳ 100");

  const { isActive } = await checkSubscription();
  console.log("⏳ 10", isActive);

  return NextResponse.json(
    { isPro: isActive }
    // {
    //   headers: {
    //     "Cache-Control": "no-cache, no-store, must-revalidate",
    //     Pragma: "no-cache",
    //     Expires: "0",
    //   },
    // }
  );
}
