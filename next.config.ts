import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // تجاهل أخطاء ESLint أثناء عملية البناء (لا تمنع النشر)
    ignoreDuringBuilds: true,
  } /* config options here */,
};
