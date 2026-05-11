import { db } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs"; // مكتبة التشفير
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"; // استيراد الطريقة التقليدية
import GitHub from "next-auth/providers/github"; // استيراد جيت هاب
import Google from "next-auth/providers/google"; // استيراد جوجل
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("unvalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  // ...
  pages: {
    signIn: "/login", // تأكد إنك محدد إن صفحة الدخول هي login
  },

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
        // التحقق من صحة المدخلات
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null; // أو رمي خطأ مخصص
        }

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        // التحقق من أن الحساب نشط
        if (user.isActive === false) {
          throw new Error("This account is disabled. Contact support.");
        }

        // التحقق من تفعيل البريد الإلكتروني (إذا كنت تستخدمه)
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in.");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      //session : عندما يضغط المستخدم على تحديث يتكون طلب خفي من المتصفح الى السيرفر وتتخزن المعلومات القادمة في هذا المتغير
      // عند أول تسجيل دخول، نضع الـ ID في التوكن
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        // --- أضف هذا السطر لضمان وجود الاسم في التوكن من البداية ---
        token.name = user.name;
      }

      // النكشة الكبرى: استقبال التحديث القادم من الكلاينت (update)
      // عندما تستدعي update({ name: "new" }) من المتصفح، تصل البيانات هنا في باراميتر session
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      //بعد التحديث يتم نقل المعلومات الجديدة الموضوعة في التوكن الي الجلسة
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
