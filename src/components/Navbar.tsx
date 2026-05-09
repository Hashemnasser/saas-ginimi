import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import dynamic from "next/dynamic";
import Link from "next/link";
const ThemeToggle = dynamic(import("./ThemeToggle"), { ssr: false });
export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex items-center justify-between px-12 py-4 border-b border-gray-200  dark:border-gray-700 bg-white dark:bg-gray-800">
      <Link href="/" className="text-2xl font-bold text-blue-600">
        MySaaS
      </Link>

      <div className="flex items-center gap-6">
        {session ? (
          <div className="flex items-center justify-between  gap-6">
            <ThemeToggle /> {/* <--- هنا */}
            <span className="text-sm text-gray-600 dark:text-gray-100">
              Hi, {session.user?.name}
            </span>
            <Link
              href="/settings"
              className="text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-black"
            >
              Settings
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-black"
            >
              Dashboard
            </Link>
            <Link
              href="/settings/webhooks"
              className="text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-black"
            >
              Webhooks
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-black"
              >
                Admin
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
                revalidatePath("/");
                revalidatePath("/dashboard");
              }}
            >
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                Logout
              </button>
            </form>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin/analytics"
                className="text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-black"
              >
                Analytics
              </Link>
            )}
            <Link
              href="/archive"
              className="text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-black"
            >
              Archive
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <ThemeToggle /> {/* <--- هنا */}
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-blue-600"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
