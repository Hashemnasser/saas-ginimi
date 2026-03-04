import { auth } from "@/auth";
import SettingsForm from "@/components/SettingsForm"; // سننشئ هذا المكون الآن
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // جلب بيانات المستخدم الحالية من نيون
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { name: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        {/* نمرر الاسم الحالي كقيمة افتراضية */}
        <SettingsForm initialName={user?.name || ""} />
      </div>
    </div>
  );
}
