import { auth } from "@/auth";
import ArchiveProjectButton from "@/components/ArchiveProjectButton";
import CreateProjectForm from "@/components/CreateProjectForm";
import EditProjectForm from "@/components/EditProjectForm";
import ShareProjectModal from "@/components/ShareProjectModal";
import UpgradeButton from "@/components/UpgradeButton";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  const { isActive, plan } = await checkSubscription();

  // جلب المشاريع التي يملكها أو يشارك فيها المستخدم
  const projects = await db.project.findMany({
    where: {
      OR: [
        { userId: session.user.id, archived: false }, // المشاريع التي أنشأها
        {
          projectMembers: { some: { userId: session.user.id } },
          archived: false,
        }, // المشاريع المشتركة
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      projectMembers: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  // عدد المشاريع الحالي
  const currentProjectsCount = projects.length;

  // الحد الأقصى (5 للمجاني، غير محدود للـ Pro)
  const maxProjects = isActive ? (plan === "PRO" ? 100 : Infinity) : 5;

  return (
    <div className="max-w-6xl mx-auto p-12   dark:bg-gray-900">
      <header className="flex justify-between items-center mb-10 border-b pb-6   dark:bg-gray-900">
        <div>
          <h1 className="text-2xl font-bold   dark:bg-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500  dark:text-gray-100">
            Welcome, {session.user.email}
          </p>
        </div>

        {plan === "BASIC" && <UpgradeButton key={session.user.id} />}
      </header>

      {/* حالة الاشتراك */}
      <div className="grid gap-6 mb-10">
        <div className="p-8 border rounded-2xl bg-slate-50  dark:bg-gray-800">
          <h2 className="font-semibold text-lg mb-2   dark:bg-gray-900">
            Subscription Status
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                plan !== "BASIC"
                  ? "bg-emerald-500"
                  : "bg-slate-300    dark:bg-gray-800"
              }`}
            />
            <p className="text-xl font-medium">
              {plan !== "BASIC"
                ? ` Premium ${plan} Plan`
                : "Standard Free Tier"}
            </p>
          </div>
        </div>
      </div>

      {/* نموذج إنشاء مشروع جديد */}
      <div className="mb-8 p-6 bg-white   dark:bg-gray-900 border border-gray-200  dark:border-gray-700 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
        <CreateProjectForm
          currentcount={currentProjectsCount}
          maxLimit={maxProjects}
        />
        {plan !== "BASIC" && currentProjectsCount >= maxProjects && (
          <p className="text-sm text-red-500 mt-2">
            You have reached the limit of free projects. Please upgrade to Pro
            to create more.
          </p>
        )}
      </div>

      {/* قائمة المشاريع */}
      <div className="bg-white   dark:bg-gray-900 border border-gray-200  dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50  dark:bg-gray-800 border-b border-gray-200  dark:border-gray-700">
          <h2 className="font-semibold">Your Projects</h2>
        </div>
        {projects.length === 0 ? (
          <p className="p-6 text-gray-500 dark:text-gray-100 text-center   dark:bg-gray-900">
            No projects yet. Create your first project above.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {projects.map((project) => {
              const userMember = project.projectMembers.find(
                (m) => m.userId === session.user.id
              );
              const role = userMember?.role;
              return (
                <li
                  key={project.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50   dark:hover:bg-gray-800"
                >
                  <div>
                    <h3 className="font-medium text-gray-900   dark:bg-gray-900 dark:text-gray-100">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-500   dark:bg-gray-900 dark:text-gray-100">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {role === "EDITOR" || role === "OWNER" ? (
                      <EditProjectForm
                        projectId={project.id}
                        initialName={project.name}
                        initialDescription={project.description}
                      />
                    ) : null}
                    {role === "OWNER" && (
                      <ArchiveProjectButton id={project.id} />
                    )}

                    <ShareProjectModal
                      projectId={project.id}
                      projectName={project.name}
                      currentMembers={project.projectMembers}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
