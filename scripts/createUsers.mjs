import bcrypt from "bcryptjs"; // استيراد مكتبة التشفير

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 جاري تحضير المستخدمين مع التشفير...");

  const saltRounds = 10; // رقم مثالي لجهاز Core 2 Duo (توازن بين الأمان والسرعة)
  const defaultPassword = "1234"; // كلمة مرور موحدة للتجربة

  // تشفير كلمة المرور مرة واحدة لاستخدامها للجميع (توفيراً لجهد المعالج)
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  const usersData = [
    { email: "obai@gmail.com", name: "Obai Admin", password: hashedPassword },

    { email: "hh@obai.com", name: "Obai ", password: hashedPassword },
    { email: "user1@test.com", name: "Ahmed", password: hashedPassword },
    { email: "user2@test.com", name: "Sara", password: hashedPassword },
    { email: "user3@test.com", name: "Khalid", password: hashedPassword },
  ];

  try {
    const result = await prisma.user.createMany({
      data: usersData,
      skipDuplicates: true, // تخطي الحسابات الموجودة مسبقاً لمنع الأخطاء
    });

    console.log(`-----------------------------------`);
    console.log(`✅ تم إضافة ${result.count} مستخدم بنجاح!`);
    console.log(`🔐 كلمة المرور للجميع هي: ${defaultPassword}`);
    console.log(`-----------------------------------`);
  } catch (error) {
    console.error("❌ خطأ في الإضافة:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
