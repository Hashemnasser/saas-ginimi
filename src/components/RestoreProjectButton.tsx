"use client";

import { restoreProject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function RestoreProjectButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRestore = async () => {
    if (!confirm("Are you sure you want to restore this?")) return;

    // 1. نظهر الرسالة فوراً خارج الـ transition لاستجابة أسرع (UI Snappiness)
    const toastId = toast.loading("Restoring...");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("projectId", id);

        const result = await restoreProject(null, formData);

        if (result?.success) {
          toast.success(result.success, { id: toastId });
          router.refresh(); // التحديث بعد النجاح
        } else {
          toast.error(result?.error || "Failed to Restore", { id: toastId });
        }
      } catch (error) {
        toast.error("An unexpected error occurred", { id: toastId });
      }
    });
  };

  return (
    <button
      title="Restore project"
      onClick={handleRestore}
      disabled={isPending} // لا تنسى تعطيل الزر أثناء المسح لمنع الضغط المتكرر
      className="text-green-600 hover:text-green-800  shadow shadow-blue-950/55 hover:scale-110 active:scale-95 transition-all p-2 disabled:opacity-50"
    >
      {isPending ? <span className="animate-pulse">...</span> : "↩️"}
    </button>
  );
}
