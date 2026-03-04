"use client";

import { loginUser } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await loginUser(formData);

    // نتحقق إذا كان هناك خطأ عائد من السيرفر أكشن
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Welcome back! Redirecting...");
      // في Next.js، التوجيه بعد تسجيل الدخول يفضل أن يكون للصفحة الرئيسية أو لوحة التحكم
      router.push("/");
      router.refresh(); // لضمان تحديث حالة السيرفر في النوافذ المفتوحة
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to access your account
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
