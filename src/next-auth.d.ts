import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

// 1. توسيع واجهة الـ User والـ Session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // نكشة: هنا نخبر تي اس بوجود الرول
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
  }
}

// 2. توسيع واجهة الـ JWT لكي يفهم الرول بداخلها أيضاً
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}
