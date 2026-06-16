import { auth } from "@/auth";
import PermanentDeleteButton from "@/components/PermanentDeleteButton"; // سننشئه
import RestoreProjectButton from "@/components/RestoreProjectButton";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ArchivePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const archivedProjects = await db.project.findMany({
    where: {
      archived: true,
      OR: [
        { userId: session.user.id },
        { projectMembers: { some: { userId: session.user.id } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      projectMembers: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-12">
      <h1 className="text-2xl font-bold mb-6">Archived Projects</h1>
      {archivedProjects.length === 0 ? (
        <p className="bg-background  text-foreground  border-border">
          No archived projects.
        </p>
      ) : (
        <ul className="space-y-4">
          {archivedProjects.map((project) => {
            const userMember = project.projectMembers.find(
              (m) => m.userId === session.user.id
            );
            const role =
              userMember?.role ||
              (project.userId === session.user.id ? "OWNER" : "VIEWER");
            return (
              <li
                key={project.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h2 className="font-semibold">{project.name}</h2>
                  {project.description && (
                    <p className="text-sm bg-background  text-foreground  border-border">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <RestoreProjectButton id={project.id} />
                  {role === "OWNER" && (
                    <PermanentDeleteButton id={project.id} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
