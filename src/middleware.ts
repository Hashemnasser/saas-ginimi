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
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// دالة خفيفة لاستخراج توكن الجلسة من الكوكيز (خاص بـ NextAuth v5)
function getSessionToken(request: NextRequest): string | undefined {
  // NextAuth v5 يستخدم اسم كوكي موحد
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  return token;
}

export function middleware(request: NextRequest) {
  const token = getSessionToken(request);
  const isLoggedIn = !!token;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProcessingPage = pathname.startsWith("/checkout/processing");

  // 1. الصفحة الرئيسية والملفات العامة
  if (pathname === "/") return NextResponse.next();

  // 2. صفحات الدخول والتسجيل
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. حماية بقية المسارات (يجب تسجيل الدخول)
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. صفحة الأدمن: نسمح بالمرور هنا، وسيتم التحقق من الدور داخل الصفحة نفسها (Server Component)
  //    هذا أفضل من إضافة وزن إضافي للميدلوير.
  if (isAdminRoute) {
    return NextResponse.next();
  }

  // 5. صفحة معالجة الدفع: التحقق من وجود session_id
  if (isProcessingPage) {
    const hasSessionId = request.nextUrl.searchParams.has("session_id");
    if (!hasSessionId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
