import { db } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs"; // مكتبة التشفير
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"; // استيراد الطريقة التقليدية
import GitHub from "next-auth/providers/github"; // استيراد جيت هاب
import Google from "next-auth/providers/google"; // استيراد جوجل

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // const { db } = await import("@/lib/db");
        // 1. ابحث عن المستخدم في قاعدة البيانات
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        // 2. إذا لم يجد المستخدم أو لا يملك كلمة مرور (لأنه سجل بجوجل مثلاً)
        if (!user || !user.password) return null;

        // 3. قارن كلمة المرور المدخلة بالمشفرة في القاعدة
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // عند أول تسجيل دخول، نضع الـ ID في التوكن
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }

      // النكشة الكبرى: استقبال التحديث القادم من الكلاينت (update)
      // عندما تستدعي update({ name: "new" }) من المتصفح، تصل البيانات هنا في باراميتر session
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      // نربط بيانات التوكن المحدثة بالجلسة التي يراها المتصفح والناف بار
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.role = token.role || "USER";
      }
      return session;
    },
  },
});
