"use client";

import { updateProject } from "@/lib/actions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

interface EditProjectFormProps {
  projectId: string;
  initialName: string;
  initialDescription?: string | null;
}

export default function EditProjectForm({
  projectId,
  initialName,
  initialDescription,
}: EditProjectFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateProject, null);
  // const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(false); // إغلاق النموذج بعد النجاح
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-white  shadow shadow-blue-950/55   hover:text-blue-600 transition-colors p-1"
        title="Edit project"
      >
        ✏️
      </button>
    );
  }

  return (
    <form
      // ref={formRef}
      action={formAction}
      className="mt-2 p-3 border rounded-lg bg-background text-foreground  border-border space-y-2"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label className="block text-sm font-medium ">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={initialName}
          className="w-full px-3 py-1 border rounded-md text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium ">Description</label>
        <textarea
          name="description"
          defaultValue={initialDescription || ""}
          rows={2}
          className="w-full px-3 py-1 border rounded-md text-sm resize-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-3 py-1 text-sm bg-gray-300 rounded-md   shadow shadow-blue-950/55 hover:bg-gray-400"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md   shadow shadow-blue-950/55 hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
