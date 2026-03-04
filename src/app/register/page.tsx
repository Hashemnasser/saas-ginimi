"use client"; // إضافة هذا السطر في الأعلى

import { registerUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await registerUser(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Account created! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <form action={handleSubmit} className="p-8 bg-white border rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Register</h1>
        <input name="name" placeholder="Name" className="w-full p-2 border mb-3 rounded" />
        <input name="email" type="email" placeholder="Email" className="w-full p-2 border mb-3 rounded" />
        <input name="password" type="password" placeholder="Password" className="w-full p-2 border mb-3 rounded" />
        <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Sign Up</button>
      </form>
    </div>
  );
}