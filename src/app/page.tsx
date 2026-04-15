import { auth } from "@/auth";
import Link from "next/link";
throw new Error("اختبار Sentry من صفحتي الرئيسية");
export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Build your SaaS faster
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl  dark:text-gray-100">
        The ultimate foundation for your next big idea. Secure, scalable, and
        ready for production.
      </p>

      {session ? (
        <div className="bg-green-50 text-green-700 px-6 py-3 rounded-full font-medium">
          Welcome back, {session.user?.email}
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white    dark:bg-gray-900 border border-gray-300  dark:border-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            View Demo
          </Link>
        </div>
      )}
    </div>
  );
}
