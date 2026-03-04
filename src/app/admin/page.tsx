import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import AdminActions from "@/components/AdminActions"; // استيراد المكون الجديد

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [userCount, projectCount, recentUsers] = await Promise.all([
    db.user.count(),
    db.project.count(),
    db.user.findMany({
      take: 10,
      orderBy: { id: "desc" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Admin Control Panel</h1>

      {/* بطاقات الإحصائيات (نفس الكود السابق) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-blue-100 rounded-2xl shadow-sm">
          <p className="text-blue-600 font-medium mb-1">Total Users</p>
          <h2 className="text-4xl font-bold text-gray-800">{userCount}</h2>
        </div>
        <div className="p-6 bg-white border border-purple-100 rounded-2xl shadow-sm">
          <p className="text-purple-600 font-medium mb-1">Total Projects</p>
          <h2 className="text-4xl font-bold text-gray-800">{projectCount}</h2>
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {u.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${u.role === "ADMIN" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {/* هنا نمرر البيانات لمكون الـ Client */}
                  <AdminActions userId={u.id} currentRole={u.role || "USER"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
