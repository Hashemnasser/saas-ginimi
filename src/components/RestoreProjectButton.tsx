"use client";

import { restoreProject } from "@/lib/actions"; // سننشئ هذه الدالة
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function RestoreProjectButton({ id }: { id: string }) {
  const [state, actionForm, isPending] = useActionState(restoreProject, null);
  const toastIdRef = useRef<string | number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isPending) {
      toastIdRef.current = toast.loading("Restoring project...");
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
        className="text-green-600 hover:text-green-800 transition-colors p-2 disabled:opacity-50"
        title="Restore project"
      >
        {isPending ? "..." : "↩️"}
      </button>
    </form>
  );
}
