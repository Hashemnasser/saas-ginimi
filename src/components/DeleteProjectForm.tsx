"use client";

import { deleteProject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function DeleteProjectPage({ id }: { id: string }) {
  const [state, actionForm, isPending] = useActionState(deleteProject, null);
  const toastIdRef = useRef<string | number | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (isPending) {
      toastIdRef.current = toast.loading("deleting the project...");
    } else {
      // عندما ينتهي الـ Pending (يصبح false)
      // نتحقق إذا كان هناك نجاح أو فشل في الـ state
      if (toastIdRef.current) {
        if (state?.success) {
          toast.success(state.success, { id: toastIdRef.current });
        } else if (state?.error) {
          toast.error(state.error, { id: toastIdRef.current });
        } else {
          // في حال لم يرجع شيء (بسبب revalidatePath) نغلق التوست على الأقل
          toast.dismiss(toastIdRef.current);
        }
        toastIdRef.current = null;
        router.refresh();
      }
    }
  }, [isPending, state]); // راقب الاثنين معاً
  return (
    <form action={actionForm}>
      <input type="hidden" name="projectId" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="text-gray-400 hover:text-red-500 transition-colors p-2 disabled:opacity-50"
        onClick={(e) => {
          if (!confirm("Are you sure?")) e.preventDefault();
        }}
      >
        {isPending ? "..." : "Delete"}
      </button>
    </form>
  );
}
