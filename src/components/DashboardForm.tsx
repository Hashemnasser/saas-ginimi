"use client";

import { createProject } from "@/lib/actions";
import { useActionState, useEffect, useRef } from "react"; // أضفنا useRef لتصفير الفورم
import { toast } from "sonner";

export default function CreateProjectForm({
  currentcount,
  maxLimit,
}: {
  currentcount: number;
  maxLimit: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createProject, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      formRef.current?.reset(); // تصفير الحقول بعد النجاح
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-3">
      <input
        name="name"
        placeholder="New Project Name..."
        className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <button
        disabled={isPending || currentcount > maxLimit}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:bg-gray-400 hover:bg-blue-700 transition-all"
      >
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
