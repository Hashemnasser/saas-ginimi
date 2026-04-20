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
    if (isPending) {
      toastIdRef.current = toast.loading("Archiving project...");
      router.refresh();
    } else {
      if (toastIdRef.current) {
        if (state?.success) {
          toast.success(state.success, { id: toastIdRef.current });
        } else if (state?.error) {
          toast.error(state.error, { id: toastIdRef.current });
        } else {
          toast.dismiss(toastIdRef.current);
        }
        toastIdRef.current = null;
        router.refresh();
      }
    }
  }, [isPending, state]);

  return (
    <form action={actionForm}>
      <input type="hidden" name="projectId" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="text-gray-400 dark:text-gray-100 hover:text-yellow-600 transition-colors p-2 disabled:opacity-50"
        title="Archive project"
        onClick={(e) => {
          if (
            !confirm(
              "Archive this project? You can restore it later from the archive."
            )
          )
            e.preventDefault();
        }}
      >
        {isPending ? "..." : "📦"}
      </button>
    </form>
  );
}
