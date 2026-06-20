import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  // جلب جلسة المستخدم لتحديد حالة الدخول
  const session = await auth();

  return (
    // حاوية رئيسية تشغل كامل ارتفاع الشاشة وتمنع التمرير
    <div className="relative h-screen flex items-center justify-center overflow-hidden shadow-top   bg-linear-to-br from-olive-600 via-amber-600 to-olive-600 ">
      {/* ===== طبقة الخلفية الفاخرة ===== */}
      <div className="absolute inset-0 -z-10">
        {/* تدرج لوني داكن كأساس للخلفية */}
        <div className="absolute inset-0 bg-linear-to-br from-black via-zinc-100 to-black/70" />

        {/* دوائر ضبابية لخلق عمق بصري وإحساس بالفخامة */}
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-400/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl" />

        {/* خطوط زخرفية رفيعة جداً عند الحواف العلوية والسفلية */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      {/* ===== المحتوى الرئيسي ===== */}
      <div className="text-center max-w-5xl mx-auto px-4 md:px-6">
        {/* الشعار: رمز عصري يوضع داخل مربع زجاجي شفاف مع تأثير ضبابي */}
        <div className="mb-2 -mt-5 inline-block p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl shadow-amber-500/10">
          <span className="text-4xl md:text-5xl">⚡</span>
        </div>

        {/* العنوان الرئيسي: بتدرج لوني ذهبي-فضي لإبراز الرقي */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-3 leading-[1.1]">
          <span className="bg-linear-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent">
            Build your SaaS
          </span>
          <br />
          <span className="bg-linear-to-r from-white via-gray-300 to-white/70 bg-clip-text text-transparent">
            faster
          </span>
        </h1>

        {/* الوصف: نص فرعي بلون ناعم مع تركيز على جزء بالذهب */}
        <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-6 leading-relaxed font-serif tracking-wide">
          The ultimate foundation for your next big idea. Secure, scalable, and
          <span className="text-amber-300/80 font-bold">
            {" "}
            ready for production.
          </span>
        </p>

        {/* ===== حالة المستخدم: مسجل دخول أم لا ===== */}
        {session ? (
          // إذا كان المستخدم مسجلاً: عرض بريده وزر للدخول إلى لوحة التحكم
          <div className="flex flex-col items-center gap-4">
            <div className="bg-linear-to-r from-amber-700 via-amber-300 to-yellow-100/40 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-2 shadow-2xl">
              <p className="text-sm md:text-base  text-white  tracking-wide">
                Welcome back,{" "}
                <span className="bg-linear-to-r from-amber-600   to-amber-900/75 bg-clip-text font-bold text-transparent text-lg ">
                  {session.user?.name}
                </span>
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3    bg-linear-to-br from-amber-500/50 via-lime-200/60 to-yellow-800 text-amber-800/80 font-semibold rounded-full shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
            >
              <span>Go to Dashboard</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        ) : (
          // إذا كان زائراً: عرض زرين (تسجيل مجاني + دخول) مع تأثيرات متقنة
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3 bg-linear-to-br from-amber-300 via-lime-100 to-yellow-600 text-black font-bold rounded-full shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105   transition-all duration-500  "
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3    bg-linear-to-br from-amber-300 via-lime-100 to-yellow-600  backdrop-blur-sm border border-white/10 text-black/80 font-bold rounded-full hover:text-black  hover:border-white/30  hover:scale-105  transition-all   duration-500 "
            >
              Sign In
            </Link>
          </div>
        )}

        {/* ===== إحصائيات سريعة للتعبير عن قوة المنتج ===== */}
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-xl font-bold bg-linear-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              500+
            </p>
            <p className="text-xs text-white/30 tracking-wider uppercase">
              Users
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold bg-linear-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              1K+
            </p>
            <p className="text-xs text-white/30 tracking-wider uppercase">
              Projects
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold bg-linear-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              99.9%
            </p>
            <p className="text-xs text-white/30 tracking-wider uppercase">
              Uptime
            </p>
          </div>
        </div>

        {/* خط زخرفي بسيط في الأسفل لإغلاق التصميم بأناقة */}
        <div className="mt-8 w-16 h-px mx-auto bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>
    </div>
  );
}
