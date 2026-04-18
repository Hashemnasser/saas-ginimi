// import { auth } from "@/auth";
// import { NextResponse } from "next/server";

// export default auth((req) => {
//   const isLoggedIn = !!req.auth;
//   const url = req.nextUrl;
//   const { pathname } = url;

//   const isAuthPage =
//     pathname.startsWith("/login") || pathname.startsWith("/register");
//   const isAdminRoute = pathname.startsWith("/admin");
//   const isProcessingPage = pathname.startsWith("/checkout/processing");
//   const userRole = req.auth?.user?.role;

//   // 1. السماح بالصفحة الرئيسية والملفات العامة دائماً
//   if (pathname === "/") return NextResponse.next();

//   // 2. إذا كان المستخدم في صفحة Auth (Login/Register) وهو مسجل دخول
//   if (isAuthPage) {
//     if (isLoggedIn) {
//       return NextResponse.redirect(new URL("/dashboard", url));
//     }
//     return NextResponse.next();
//   }

//   // 3. حماية المسارات (يجب أن يكون مسجل دخول لدخول أي شيء غير ما سبق)
//   if (!isLoggedIn) {
//     // نسمح فقط بصفحات تسجيل الدخول، أي شيء آخر يطرد للمدونة أو تسجيل الدخول
//     return NextResponse.redirect(new URL("/", url));
//   }

//   // 4. حماية صفحة الأدمن (للمسجلين فقط)
//   if (isAdminRoute) {
//     if (!userRole || userRole !== "ADMIN")
//       return NextResponse.redirect(new URL("/dashboard", url));
//   }

//   // 5. حماية صفحة الانتظار (منع الدخول إليها بدون session_id كزيادة أمان)
//   if (isProcessingPage) {
//     const hasSessionId = url.searchParams.has("session_id");
//     if (!hasSessionId) {
//       return NextResponse.redirect(new URL("/dashboard", url));
//     }
//     // إذا كان مسجل دخول ومعه ID، يسمح له بالمرور
//     return NextResponse.next();
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// هذا الكود اخف حجما كي نستطيع نشره على فيرسل

// src/middleware.ts
// import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export async function middleware(request: NextRequest) {
//   // الحصول على التوكن بشكل رسمي وآمن
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//     secureCookie: process.env.NODE_ENV === "production",
//   });

//   const isLoggedIn = !!token;
//   const { pathname } = request.nextUrl;

//   const isAuthPage =
//     pathname.startsWith("/login") || pathname.startsWith("/register");
//   const isAdminRoute = pathname.startsWith("/admin");
//   const isProcessingPage = pathname.startsWith("/checkout/processing");

//   // 1. الصفحة الرئيسية والملفات العامة
//   if (pathname === "/") return NextResponse.next();

//   // 2. صفحات الدخول والتسجيل
//   if (isAuthPage) {
//     if (isLoggedIn) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return NextResponse.next();
//   }

//   // 3. حماية بقية المسارات (يجب تسجيل الدخول)
//   if (!isLoggedIn) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   // 4. صفحة الأدمن: التحقق من الدور إذا أردت
//   if (isAdminRoute && token?.role !== "ADMIN") {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   // 5. صفحة معالجة الدفع: التحقق من وجود session_id
//   if (isProcessingPage) {
//     const hasSessionId = request.nextUrl.searchParams.has("session_id");
//     if (!hasSessionId) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProcessingPage = pathname.startsWith("/checkout/processing");
  const userRole = req.auth?.user?.role;

  // 1. الصفحة الرئيسية
  if (pathname === "/") return;

  // 2. صفحات الدخول والتسجيل
  if (isAuthPage) {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.url));
    return;
  }

  // 3. حماية بقية المسارات
  if (!isLoggedIn) return Response.redirect(new URL("/", req.url));

  // 4. صفحة الأدمن
  if (isAdminRoute && userRole !== "ADMIN") {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  // 5. صفحة معالجة الدفع
  if (isProcessingPage) {
    const hasSessionId = req.nextUrl.searchParams.has("session_id");
    if (!hasSessionId) return Response.redirect(new URL("/dashboard", req.url));
    return;
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
