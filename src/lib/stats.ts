import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { unstable_cache } from "next/cache"; // إضافة الكاش

// تحويل الدالة إلى دالة مخزنة (Cached) لتوفير موارد السيرفر وسترايب

export const getCachedStats = unstable_cache(
  async () => {
    const [userCount, projectCount, activeSubscriptions] = await Promise.all([
      db.user.count(),
      db.project.count(),
      db.user.count({ where: { stripeSubscriptionStatus: true } }),
    ]);

    let mrr = 0;
    try {
      // استخدام auto-paging من سترايب بدلاً من while اليدوية (أسهل وأضمن)
      for await (const sub of stripe.subscriptions.list({
        status: "active",
        limit: 100,
        expand: ["data.items.data.price"], // جلب تفاصيل السعر مسبقاً
      })) {
        const price = sub.items.data[0]?.price;
        if (price && price.unit_amount) {
          let monthlyAmount = price.unit_amount;
          if (price.recurring?.interval === "year") {
            monthlyAmount = Math.floor(monthlyAmount / 12);
          }
          mrr += monthlyAmount;
        }
      }
    } catch (error) {
      console.error("Stripe MRR fetch error:", error);
    }

    return {
      userCount,
      projectCount,
      activeSubscriptions,
      mrr: mrr / 100,
    };
  },
  ["admin-stats"], // مفتاح الكاش
  { revalidate: 3000, tags: ["admin-stats"] } // تحديث البيانات كل ساعة فقط
);

export const getCachedGrowthData = unstable_cache(
  async () => getGrowthData(),
  ["admin-growth-data"],
  { revalidate: 3600, tags: ["admin-growth-data"] }
);

// الحصول على بيانات النمو (آخر 12 شهراً)
async function getGrowthData() {
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
