// app/checkout/processing/page.tsx
import ProcessingContent from "@/components/ProcessingContent";
import { Suspense } from "react";

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          جاري التحميل...
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
