"use client";

import { removeUser, toggleRole } from "@/lib/actions";
import { useState } from "react";
import { toast } from "sonner";

interface AdminActionsProps {
  userId: string;
  currentRole: string;
  userName: string;
}

export default function AdminActions({
  userId,
  currentRole,
  userName,
}: AdminActionsProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleToggleRole = async () => {
    setIsToggling(true);
    const result = await toggleRole(userId, currentRole);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.success);
    }
    setIsToggling(false);
  };

  const handleDeleteUser = async () => {
    if (!confirm(`are you sure delete this user${userName} `)) return;

    setIsDeleting(true);
    const result = await removeUser(userId);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.success);
    }
    setIsDeleting(false);
  };

  return (
    <div className="text-right space-x-2 flex justify-end">
      <button
        onClick={handleToggleRole}
        disabled={isToggling || isDeleting}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
      >
        {isToggling ? "..." : "change role"}
      </button>

      <button
        onClick={handleDeleteUser}
        disabled={isDeleting || isToggling}
        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
      >
        {isDeleting ? "..." : "delete"}
      </button>
    </div>
  );
}
