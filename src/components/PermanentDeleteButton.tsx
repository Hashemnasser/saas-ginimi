"use client";

import { permanentDeleteProject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function PermanentDeleteButton({ id }: { id: string }) {
  const [state, actionForm, isPending] = useActionState(
    permanentDeleteProject,
    null
  );
  const toastIdRef = useRef<string | number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isPending) {
      toastIdRef.current = toast.loading("Deleting permanently...");
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
        className="text-red-600 hover:text-red-800 transition-colors p-2 disabled:opacity-50"
        title="Permanently delete"
        onClick={(e) => {
          if (
            !confirm(
              "Permanently delete this project? This action cannot be undone."
            )
          )
            e.preventDefault();
        }}
      >
        {isPending ? "..." : "🗑️"}
      </button>
    </form>
  );
}
