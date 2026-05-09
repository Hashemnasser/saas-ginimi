"use client";

import { loginWithGithub, loginWithGoogle, registerUser } from "@/lib/actions";
import { toast } from "sonner";

export default function RegisterPage() {
  async function handleSubmit(formData: FormData) {
    const result = await registerUser(formData);
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="p-8 bg-white dark:bg-gray-900 border rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          Create an Account
        </h1>

        {/* فورم التسجيل العادي */}
        <form action={handleSubmit}>
          {/* ... الـ inputs تبعك كما هي ... */}
          <input name="name" placeholder="Name" className="..." required />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="..."
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="..."
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
            Sign Up
          </button>
        </form>

        {/* فاصل "أو" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* أزرار السوشيال ميديا */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => loginWithGoogle()}
            className="flex items-center justify-center gap-2 border py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Google
          </button>
          <button
            onClick={() => loginWithGithub()}
            className="flex items-center justify-center gap-2 border py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { loginUser } from "@/lib/actions";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// export default function LoginPage(): React.JSX.Element {
//   const router = useRouter();

//   const handleSubmit = async (formData: FormData) => {
//     const result = await loginUser(formData);

//     // نتحقق إذا كان هناك خطأ عائد من السيرفر أكشن
//     if (result?.error) {
//       toast.error(result.error);
//     } else {
//       toast.success("Welcome back! Redirecting...");
//       // في Next.js، التوجيه بعد تسجيل الدخول يفضل أن يكون للصفحة الرئيسية أو لوحة التحكم
//       router.push("/");
//       router.refresh(); // لضمان تحديث حالة السيرفر في النوافذ المفتوحة
//     }
//   };

//   return (
//     <div className="flex min-h-[80vh] items-center justify-center">
//       <div className="w-full max-w-md p-8 bg-white   dark:bg-gray-900 border border-gray-200  dark:border-gray-700 rounded-2xl shadow-sm">
//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-bold">Sign In</h1>
//           <p className="text-sm text-gray-500  dark:text-gray-100">
//             Enter your credentials to access your account
//           </p>
//         </div>

//         <form action={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700  dark:text-gray-100">
//               Email Address
//             </label>
//             <input
//               name="email"
//               type="email"
//               className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
//               placeholder="name@example.com"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700  dark:text-gray-100">
//               Password
//             </label>
//             <input
//               name="password"
//               type="password"
//               className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-2.5 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
//           >
//             Sign In
//           </button>
//         </form>

//         <div className="mt-6 text-center text-sm text-gray-600  dark:text-gray-100">
//           Don't have an account?{" "}
//           <Link
//             href="/register"
//             className="text-blue-600 hover:underline font-medium"
//           >
//             Create one
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
