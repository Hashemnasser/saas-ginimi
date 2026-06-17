import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
// const ThemeToggle = dynamic(import("./ThemeToggle"), { ssr: false })ما اشتغل هذا الحل لان ممنوع تعمل  ssr: false  على السيرفر كومبوننت
export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex items-center    justify-between px-12 py-6 border-b bg-background  text-foreground  border-border shadow shadow-amber-50">
      <Link
        href="/"
        className="text-2xl font-bold text-blue-600   hover:animate-pulse"
      >
        MySaaS
      </Link>

      <div className="flex items-center gap-6">
        {session ? (
          <div className="flex items-center justify-between  gap-6">
            <ThemeToggle /> {/* <--- هنا */}
            <span className="text-sm bg-background  text-foreground  ">
              Hi : {session.user?.name}
            </span>
            <Link
              href="/settings"
              className="text-sm font-medium   text-foreground   hover:text-blue-600 "
            >
              Settings
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium  text-foreground   hover:text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              href="/settings/webhooks"
              className="text-sm font-medium   text-foreground  hover:text-blue-600"
            >
              Webhooks
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-medium   text-foreground  hover:text-blue-600"
              >
                Admin
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin/analytics"
                className="text-sm font-medium   text-foreground   hover:text-blue-600  "
              >
                Analytics
              </Link>
            )}
            <Link
              href="/archive"
              className="text-sm font-medium bg-background  text-foreground  border-border hover:text-blue-600"
            >
              Archive
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
                revalidatePath("/");
                revalidatePath("/dashboard");
              }}
            >
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow shadow-blue-950/55 hover:bg-red-300       transition-all   hover:animate-pulse   duration-75 ">
                Logout
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <ThemeToggle /> {/* <--- هنا */}
            <Link
              href="/login"
              className="text-sm font-medium bg-background  text-foreground  border-border hover:hover:text-blue-600"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium   text-foreground  bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
