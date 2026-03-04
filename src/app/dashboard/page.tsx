import { auth } from "@/auth"; // استيراد auth من ملف الإعدادات الرئيسي
import UpgradeButton from "@/components/UpgradeButton";
import { checkSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";

/**
 * صفحة الداشبورد متوافقة مع Auth v5
 */

export const dynamic = "force-dynamic"; // إجبار الصفحة على جلب البيانات في كل زيارة
export const revalidate = 0; // عدم تخزين الصفحة في الكاش نهائياً
export default async function DashboardPage() {
  // جلب الجلسة في v5 أسرع وأبسط
  const session = await auth();

  // الحماية: إذا لم تكن هناك جلسة، توجه للرئيسية
  if (!session || !session.user) {
    redirect("/");
  }

  // التحقق من حالة البرو
  const isPro = await checkSubscription();

  return (
    <div className="max-w-6xl mx-auto p-12">
      <header className="flex justify-between items-center mb-10 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {session.user.email}</p>
        </div>

        {/* زر الترقية يعتمد على session.user.id الذي أضفناه في callbacks */}
        {!isPro && <UpgradeButton userId={session.user.id!} />}
      </header>

      <div className="grid gap-6">
        <div className="p-8 border rounded-2xl bg-slate-50">
          <h2 className="font-semibold text-lg mb-2">Subscription Status</h2>
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                isPro ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            <p className="text-xl font-medium">
              {isPro ? "Premium Pro Plan" : "Standard Free Tier"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
