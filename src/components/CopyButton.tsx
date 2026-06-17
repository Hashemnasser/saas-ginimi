"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string; // النص المطلوب نسخه
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("success copy");
    } catch (err) {
      toast.error(`failed cpoy ${err}`);
      console.error("failed copy", err);
    }
  };

  // إعادة تعيين حالة "تم النسخ" بعد 2 ثانية
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1.5 rounded-md bg-border hover:bg-muted transition-colors focus:outline-none shadow shadow-blue-950/55  animate-pulse"
      aria-label="Copy key"
      title="     Copy key"
    >
      {copied ? (
        // ✅ أيقونة "تم النسخ" (علامة صح)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        // 📋 أيقونة "نسخ" (ورقتان)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      )}
    </button>
  );
}
