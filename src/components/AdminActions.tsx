"use client";

import { toggleRole, removeUser } from "@/lib/actions";

interface AdminActionsProps {
  userId: string;
  currentRole: string;
}

export default function AdminActions({ userId, currentRole }: AdminActionsProps) {
  return (
    <div className="text-right space-x-2 flex justify-end">
      {/* زر تغيير الرتبة */}
      <button 
        onClick={async () => {
          await toggleRole(userId, currentRole);
        }}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
      >
        Change Role
      </button>

      {/* زر الحذف */}
      <button 
        onClick={async () => {
          if (confirm("Are you sure you want to delete this user?")) {
            await removeUser(userId);
          }
        }}
        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
      >
        Delete
      </button>
    </div>
  );
}