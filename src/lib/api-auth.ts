import { db } from "@/lib/db";
import { NextRequest } from "next/server";

/**
 * تتحقق من وجود مفتاح API صالح في طلب الـ API
 * @returns { userId: string } | null
 */
export async function verifyApiKey(request: NextRequest) {
  // 1. جلب الـ Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  // 2. استخراج المفتاح (نزيل كلمة "Bearer " من البداية)
  const apiKey = authHeader.slice(7); // "Bearer sk_live_..." -> "sk_live_..."

  // 3. البحث عن مستخدم لديه هذا المفتاح و apiKeyEnabled = true
  const user = await db.user.findFirst({
    where: {
      apiKey: apiKey,
      apiKeyEnabled: true,
    },
    select: { id: true }, // نريد فقط معرف المستخدم
  });

  if (!user) return null;

  return { userId: user.id };
}
