"use client";

import { createProject } from "@/lib/actions";
import { useActionState, useEffect, useRef } from "react";
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
      formRef.current?.reset();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700  dark:text-gray-100 mb-1"
        >
          Project Name
        </label>
        <input
          id="name"
          name="name"
          placeholder="My Awesome Project"
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="What is this project about?"
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isPending || currentcount > maxLimit}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:bg-gray-400 hover:bg-blue-700 transition-all"
        >
          {isPending ? "Creating..." : "Create Project"}
        </button>
        {!isPending && currentcount > maxLimit && (
          <span className="text-sm text-red-500">Limit reached</span>
        )}
      </div>
    </form>
  );
}
