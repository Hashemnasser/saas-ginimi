"use client";

import { updateProfile } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsForm({ initialName }: { initialName: string }) {
  const { update } = useSession();
  const router = useRouter();
  async function handleSubmit(formData: FormData) {
    const result = await updateProfile(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      await update({ name: formData.get("name") as string });
      router.refresh(); // لضمان تحديث حالة السيرفر في النوافذ المفتوحة

      toast.success("Name updated! Refreshing...");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Display Name
        </label>
        <input
          name="name"
          defaultValue={initialName} // هنا يظهر الاسم القديم تلقائياً
          className="w-full px-4 py-2 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  );
}
