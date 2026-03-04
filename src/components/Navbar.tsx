import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      <Link href="/" className="text-2xl font-bold text-blue-600">
        MySaaS
      </Link>

      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Hi, {session.user?.name}
            </span>
            <Link
              href="/settings"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Settings
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Dashboard
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                Logout
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/api/auth/signin"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
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
