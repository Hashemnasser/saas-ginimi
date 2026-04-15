import { checkSubscription } from "@/lib/subscription"; // تأكد من المسار الصحيح لدالتك
import { NextResponse } from "next/server";

export async function GET() {
  // استدعاء دالتك التي كتبتها أنت
  const isPro = await checkSubscription();
  console.log("⏳ 10", isPro);

  return NextResponse.json({ isPro: !!isPro });
}
