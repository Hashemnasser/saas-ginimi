import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
// const ThemeToggle = dynamic(import("./ThemeToggle"), { ssr: false })ما اشتغل هذا الحل لان ممنوع تعمل  ssr: false  على السيرفر كومبوننت
export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex items-center    justify-between px-12 py-6 border-b bg-background  text-foreground  border-border shadow-lg shadow-yellow-50">
      <Link href="/">
        <h1 className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 leading-[1.1]">
          <span className="bg-linear-to-r from-amber-900 via-yellow-300 to-amber-300 bg-clip-text text-transparent">
            MySaaS
          </span>
        </h1>
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
              className="px-4 py-2 text-sm     bg-linear-to-br from-amber-200 via-lime-100 to-yellow-500 text-black/80 font-bold rounded-full  hover:scale-105 duration-500 "
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm     bg-linear-to-br from-amber-300 via-lime-100 to-yellow-600 text-black font-bold rounded-full  hover:scale-105 duration-500 "
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
