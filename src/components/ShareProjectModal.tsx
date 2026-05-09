"use client";

import { useState } from "react";
import { toast } from "sonner";

// export interface ShareProjectModalProps {
//   projectId: string;
//   projectName: string;
//   currentMembers: Array<{
//     userId: string;
//     role: string;
//     user: { name?: string | null; email: string | null };
//   }>;
// }

export interface ShareProjectModalProps {
  projectId: string;
  projectName: string;
  currentMembers: {
    userId: string;
    role: "OWNER" | "EDITOR" | "VIEWER";
    user: { name?: string | null; email: string | null };
  }[];
}

export default function ShareProjectModal({
  projectId,
  projectName,
  currentMembers: initialCurrentMembers,
}: ShareProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);
  const [currentMembers, setCurrentMembers] = useState(initialCurrentMembers);

  const handleInvite = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, email, role }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Invitation sent to ${email}`);
        setCurrentMembers((prev) => [data.newMember, ...prev]);
        setEmail("");

        // يمكنك تحديث القائمة هنا بإعادة جلب البيانات
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 dark:text-gray-100 hover:text-green-600 transition-colors p-1"
        title="Share project"
      >
        🔗
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50  dark:bg-gray-100 flex items-center justify-center z-50">
          <div className="bg-white   dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Share "{projectName}"</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="EDITOR">Editor</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm bg-gray-300  dark:bg-gray-800 rounded-md"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Current members</h3>
              <ul className="space-y-1">
                {currentMembers.map((member) => (
                  <li
                    key={member.userId}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {member.user.email}{" "}
                      {member.user.name && `(${member.user.name})`}
                    </span>
                    <span className="text-gray-500 dark:text-gray-100">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
