// // import { auth } from "@/auth";
// // import { NextResponse } from "next/server";

// // export default auth((req) => {
// //   const isLoggedIn = !!req.auth;
// //   const url = req.nextUrl;
// //   const { pathname } = url;

// //   const isAuthPage =
// //     pathname.startsWith("/login") || pathname.startsWith("/register");
// //   const isAdminRoute = pathname.startsWith("/admin");
// //   const isProcessingPage = pathname.startsWith("/checkout/processing");
// //   const userRole = req.auth?.user?.role;

// //   // 1. السماح بالصفحة الرئيسية والملفات العامة دائماً
// //   if (pathname === "/") return NextResponse.next();

// //   // 2. إذا كان المستخدم في صفحة Auth (Login/Register) وهو مسجل دخول
// //   if (isAuthPage) {
// //     if (isLoggedIn) {
// //       return NextResponse.redirect(new URL("/dashboard", url));
// //     }
// //     return NextResponse.next();
// //   }

// //   // 3. حماية المسارات (يجب أن يكون مسجل دخول لدخول أي شيء غير ما سبق)
// //   if (!isLoggedIn) {
// //     // نسمح فقط بصفحات تسجيل الدخول، أي شيء آخر يطرد للمدونة أو تسجيل الدخول
// //     return NextResponse.redirect(new URL("/", url));
// //   }

// //   // 4. حماية صفحة الأدمن (للمسجلين فقط)
// //   if (isAdminRoute) {
// //     if (!userRole || userRole !== "ADMIN")
// //       return NextResponse.redirect(new URL("/dashboard", url));
// //   }

// //   // 5. حماية صفحة الانتظار (منع الدخول إليها بدون session_id كزيادة أمان)
// //   if (isProcessingPage) {
// //     const hasSessionId = url.searchParams.has("session_id");
// //     if (!hasSessionId) {
// //       return NextResponse.redirect(new URL("/dashboard", url));
// //     }
// //     // إذا كان مسجل دخول ومعه ID، يسمح له بالمرور
// //     return NextResponse.next();
// //   }

// //   return NextResponse.next();
// // });

// // export const config = {
// //   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// // };

// // هذا الكود اخف حجما كي نستطيع نشره على فيرسل
// // src/middleware.ts
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// // دالة خفيفة لاستخراج توكن الجلسة من الكوكيز (خاص بـ NextAuth v5)
// function getSessionToken(request: NextRequest): string | undefined {
//   // NextAuth v5 يستخدم هذا الاسم للكوكي
//   const token =
//     request.cookies.get("next-auth.session-token")?.value ||
//     request.cookies.get("__Secure-next-auth.session-token")?.value;
//   return token;
// }

// export function middleware(request: NextRequest) {
//   const token = getSessionToken(request);
//   const isLoggedIn = !!token;
//   const { pathname } = request.nextUrl;

//   // تعريف المسارات العامة (لا تحتاج تسجيل دخول)
//   const publicPaths = [
//     "/",
//     "/pricing",
//     "/login",
//     "/register",
//     "/sentry-example-page",
//   ];
//   const isPublicPath =
//     publicPaths.includes(pathname) ||
//     pathname.startsWith("/api/") ||
//     pathname.startsWith("/_next/") ||
//     pathname.includes("."); // الملفات الثابتة (css, js, images)

//   // 1. السماح بالصفحات العامة
//   if (isPublicPath) {
//     // إذا كان المستخدم مسجلاً ويحاول الدخول إلى login/register، وجهه إلى dashboard
//     if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return NextResponse.next();
//   }

//   // 2. بقية المسارات (مثل /dashboard, /settings, /admin, /checkout/processing) تتطلب تسجيل دخول
//   if (!isLoggedIn) {
//     // حفظ المسار الأصلي لإعادة التوجيه إليه بعد تسجيل الدخول (اختياري)
//     const callbackUrl = encodeURIComponent(pathname);
//     return NextResponse.redirect(
//       new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
//     );
//   }

//   // 3. للمستخدمين المسجلين: نسمح بالمرور (سيتم التحقق من صلاحية الأدمن داخل الصفحة نفسها لاحقاً)
//   //    إذا أردت منع غير الأدمن من الوصول إلى /admin يمكن إضافته هنا، لكنه سيزيد الحجم قليلاً.
//   //    الأفضل نقل التحقق من دور الأدمن إلى داخل صفحة /admin باستخدام auth() العادي (Server Component).
//   return NextResponse.next();
// }

// // تحديد المسارات التي يعمل عليها الميدلوير (تجنب api و _next والملفات الثابتة)
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
// };
// // import { auth } from "@/auth";

// // export default auth((req) => {
// //   const isLoggedIn = !!req.auth;
// //   const { pathname } = req.nextUrl;

// //   const isAuthPage =
// //     pathname.startsWith("/login") || pathname.startsWith("/register");
// //   const isAdminRoute = pathname.startsWith("/admin");
// //   const isProcessingPage = pathname.startsWith("/checkout/processing");
// //   const userRole = req.auth?.user?.role;

// //   // 1. الصفحة الرئيسية
// //   if (pathname === "/") return;

// //   // 2. صفحات الدخول والتسجيل
// //   if (isAuthPage) {
// //     if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.url));
// //     return;
// //   }

// //   // 3. حماية بقية المسارات
// //   if (!isLoggedIn) return Response.redirect(new URL("/", req.url));

// //   // 4. صفحة الأدمن
// //   if (isAdminRoute && userRole !== "ADMIN") {
// //     return Response.redirect(new URL("/dashboard", req.url));
// //   }

// //   // 5. صفحة معالجة الدفع
// //   if (isProcessingPage) {
// //     const hasSessionId = req.nextUrl.searchParams.has("session_id");
// //     if (!hasSessionId) return Response.redirect(new URL("/dashboard", req.url));
// //     return;
// //   }

// //   return;
// // });

// // export const config = {
// //   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// // };

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. استثناء الويب-هوك فوراً (أهم خطوة لحل مشكلة 303)
  // هذا يضمن أن طلبات Stripe لن تخضع لأي فحص تسجيل دخول
  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  // 2. الحصول على التوكن وفك تشفيره باستخدام getToken
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role;
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProcessingPage = pathname.startsWith("/checkout/processing");

  // 2. السماح للصفحة الرئيسية والملفات العامة
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. إذا كان المستخدم في صفحة Auth وهو مسجل دخول -> حوله للداشبورد
  if (isAuthPage) {
    if (isLoggedIn) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. إذا لم يكن مسجلاً ويحاول دخول أي صفحة محمية (استثناء الـ API هنا أيضاً)
  if (!isLoggedIn && !pathname.startsWith("/api")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 5. حماية صفحة معالجة الدفع
  if (isProcessingPage) {
    if (!url.searchParams.has("session_id")) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  // 6. صفحة الأدمن
  if (isAdminRoute && userRole !== "ADMIN") {
    url.pathname = "/dashboard";
    return Response.redirect(url);
  }

  return NextResponse.next();
}

// تعديل الـ matcher ليكون أكثر دقة
export const config = {
  matcher: [
    /*
     * استثناء كل المسارات التي تبدأ بـ:
     * - api (المسؤول عن الويب-هوك)
     * - _next/static (الملفات الثابتة)
     * - _next/image (تحسين الصور)
     * - favicon.ico (أيقونة الموقع)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
