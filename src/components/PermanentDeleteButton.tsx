"use client";

import { permanentDeleteProject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function PermanentDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this?")) return;

    // 1. نظهر الرسالة فوراً خارج الـ transition لاستجابة أسرع (UI Snappiness)
    const toastId = toast.loading("Deleting permanently...");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("projectId", id);

        const result = await permanentDeleteProject(null, formData);

        if (result?.success) {
          toast.success(result.success, { id: toastId });
          router.refresh(); // التحديث بعد النجاح
        } else {
          toast.error(result?.error || "Failed to delete", { id: toastId });
        }
      } catch (error) {
        toast.error("An unexpected error occurred", { id: toastId });
      }
    });
  };

  return (
    <button
      title="Permanent Delete"
      onClick={handleDelete}
      disabled={isPending} // لا تنسى تعطيل الزر أثناء المسح لمنع الضغط المتكرر
      className="text-red-600  shadow shadow-blue-950/55 hover:text-red-800 transition-colors p-2 disabled:opacity-50"
    >
      {isPending ? <span className="animate-pulse">...</span> : "🗑️"}
    </button>
  );
}
