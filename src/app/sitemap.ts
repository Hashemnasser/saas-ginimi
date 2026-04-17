// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://saas-ginimi.vercel.app";

  // الصفحات الثابتة في مشروعك
  const routes = [
    "",
    "/dashboard",
    "/pricing",
    "/login",
    "/register",
    "/settings",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // يمكنك إضافة صفحات ديناميكية هنا لاحقاً (مثل /projects/[id])
  // عن طريق جلب البيانات من قاعدة البيانات

  return routes;
}
