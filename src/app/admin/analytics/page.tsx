import { auth } from "@/auth";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import GrowthCharts from "@/components/admin/GrowthCharts";
import { db } from "@/lib/db";
import { getGrowthData } from "@/lib/stats";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

// دالة جلب الإحصائيات مباشرة من المصادر
async function getStatsData() {
  // 1. عدد المستخدمين والمشاريع والاشتراكات النشطة من قاعدة البيانات
  const [userCount, projectCount, activeSubscriptions] = await Promise.all([
    db.user.count(),
    db.project.count(),
    db.user.count({ where: { stripeSubscriptionStatus: true } }),
  ]);

  // 2. جلب MRR من Stripe
  let mrr = 0;
  try {
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    while (hasMore) {
      const subscriptions: any = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        starting_after: startingAfter,
      });
      for (const sub of subscriptions.data) {
        const price = sub.items.data[0]?.price;
        if (price && price.unit_amount) {
          let monthlyAmount = price.unit_amount;
          if (price.recurring?.interval === "year") {
            monthlyAmount = Math.floor(monthlyAmount / 12);
          }
          mrr += monthlyAmount;
        }
      }
      hasMore = subscriptions.has_more;
      startingAfter = subscriptions.data[subscriptions.data.length - 1]?.id;
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
}

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, growData] = await Promise.all([
    getStatsData(),
    getGrowthData(),
  ]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Analytics Dashboard</h1>
      <AnalyticsCharts stats={stats} />
      <div className="mt-8">
        <GrowthCharts data={growData} />
      </div>
    </div>
  );
}
