import { db } from "@/lib/db";
// الحصول على بيانات النمو (آخر 12 شهراً)
export async function getGrowthData() {
  const now = new Date();
  const months = [];
  // إنشاء مصفوفة تحتوي على آخر 12 شهراً (من الأقدم إلى الأحدث)
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    months.push({
      month: start.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      start,
      end,
    });
  }

  // جلب البيانات لكل شهر
  const growthData = await Promise.all(
    months.map(async (m) => {
      // عدد المستخدمين الجدد
      const newUsers = await db.user.count({
        where: {
          createdAt: {
            gte: m.start,
            lte: m.end,
          },
        },
      });
      // عدد المشاريع الجديدة
      const newProjects = await db.project.count({
        where: {
          createdAt: {
            gte: m.start,
            lte: m.end,
          },
        },
      });
      const newSubscriptions = await db.user.count({
        where: {
          stripeSubscriptionStart: {
            gte: m.start, // من بداية الشهر
            lte: m.end, // لنهاية الشهر
          },
        },
      });

      return {
        month: m.month,
        newUsers,
        newProjects,
        newSubscriptions,
      };
    })
  );

  return growthData;
}
