"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // ضروري تحط القوسين {}في يوز ايفيكت
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []); //الغاية ما نخلي المتصفح يعرض الزر يلي متشكل في السيرفر باول عملية رندر بل انو منأخرو للمرة الثانية وبالتالي الرندرة بتصير بالمتصفح بناء على معلومات المتصفح نفسه

  if (!theme) return null; // أو زر مؤقت
  if (!mounted) return null; //   تجنب عدم التطابق مع الخادم  لان الخادم حاطط قيمة اتراضية والوضع للموقع مخزن ب اللوكال ستورج ويتبع لوضع المتصفح الحالي

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
