"use client";

import { archiveProject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ArchiveProjectButton({ id }: { id: string }) {
  const [state, actionForm, isPending] = useActionState(archiveProject, null);
  const toastIdRef = useRef<string | number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // نتحقق من وجود نتيجة (سواء نجاح أو فشل)
    if (state?.success) {
      toast.success(state.success);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]); // نراقب الـ state فقط هنا

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        "Archive this project? You can restore it later from the archive."
      )
    ) {
      e.preventDefault();
      return;
    }
    // نظهر رسالة التحميل فوراً عند الإرسال
    toast.loading("Archiving project...", { id: "archive-toast" });
  };
  return (
    <form action={actionForm} onSubmit={handleSubmit}>
      <input type="hidden" name="projectId" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="text-gray-400 dark:text-gray-100 hover:text-yellow-600 transition-colors p-2 disabled:opacity-50"
        title="Archive project"
      >
        {isPending ? "..." : "📦"}
      </button>
    </form>
  );
}
