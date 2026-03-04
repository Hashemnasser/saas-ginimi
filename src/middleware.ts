import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const url = req.nextUrl;
  const { pathname } = url;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProcessingPage = pathname.startsWith("/checkout/processing");
  const userRole = req.auth?.user?.role;

  // 1. السماح بالصفحة الرئيسية والملفات العامة دائماً
  if (pathname === "/") return NextResponse.next();

  // 2. إذا كان المستخدم في صفحة Auth (Login/Register) وهو مسجل دخول
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", url));
    }
    return NextResponse.next();
  }

  // 3. حماية المسارات (يجب أن يكون مسجل دخول لدخول أي شيء غير ما سبق)
  if (!isLoggedIn) {
    // نسمح فقط بصفحات تسجيل الدخول، أي شيء آخر يطرد للمدونة أو تسجيل الدخول
    return NextResponse.redirect(new URL("/login", url));
  }

  // 4. حماية صفحة الأدمن (للمسجلين فقط)
  if (isAdminRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // 5. حماية صفحة الانتظار (منع الدخول إليها بدون session_id كزيادة أمان)
  if (isProcessingPage) {
    const hasSessionId = url.searchParams.has("session_id");
    if (!hasSessionId) {
      return NextResponse.redirect(new URL("/dashboard", url));
    }
    // إذا كان مسجل دخول ومعه ID، يسمح له بالمرور
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
