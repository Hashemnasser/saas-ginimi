"use client";

import { archiveProject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function ArchiveProjectButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleArchive = async () => {
    // 1. طلب تأكيد من المستخدم
    if (
      !confirm(
        "Archive this project? You can restore it later from the archive."
      )
    ) {
      return;
    }

    // 2. إظهار رسالة التحميل وتخزين الـ ID الخاص بها لتحديثها لاحقاً
    const toastId = toast.loading("Archiving project...");

    // 3. بدء العملية باستخدام startTransition
    startTransition(async () => {
      try {
        // تجهيز البيانات لإرسالها للأكشن
        const formData = new FormData();
        formData.append("projectId", id);

        // استدعاء الأكشن مباشرة
        // نمرر null كـ prevState لأننا لا نستخدم useActionState هنا
        const result = await archiveProject(null, formData);

        if (result?.success) {
          // تحديث نفس الـ Toast برسالة النجاح
          toast.success(result.success, { id: toastId });

          // تحديث بيانات الصفحة
          router.refresh();
        } else if (result?.error) {
          // تحديث نفس الـ Toast برسالة الخطأ
          toast.error(result.error, { id: toastId });
        }
      } catch (error) {
        // في حال حدوث خطأ تقني غير متوقع
        toast.error("An unexpected error occurred", { id: toastId });
      }
    });
  };

  return (
    <button
      onClick={handleArchive}
      disabled={isPending}
      className="  text-foreground  shadow shadow-blue-950/55 hover:text-yellow-600 transition-colors p-2 disabled:opacity-50"
      title="Archive project"
    >
      {isPending ? <span className="animate-pulse">...</span> : "📦"}
    </button>
  );
}
