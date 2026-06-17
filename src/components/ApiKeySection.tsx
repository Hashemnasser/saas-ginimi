"use client";

import { generateApiKey } from "@/lib/actions";
import { useState } from "react";
import { toast } from "sonner";
import CopyButton from "./CopyButton";

interface ApiKeySectionProps {
  initialKey?: string | null; // المفتاح الموجود حالياً (إن وجد)
  initialEnabled?: boolean; // هل الـ API مفعل؟
}

export default function ApiKeySection({
  initialKey,
  initialEnabled,
}: ApiKeySectionProps) {
  const [apiKey, setApiKey] = useState(initialKey);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateApiKey();
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setApiKey(result.apiKey!);
      setIsEnabled(true);
      toast.success(result.success);
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold mb-4">API Access</h2>
      {apiKey ? (
        <div>
          <p className="text-sm bg-background    border-border  text-rose-400">
            Your secret API key.{" "}
            <strong className="font-extrabold animate-pulse ">
              Keep it safe!
            </strong>{" "}
            It will not be shown again.
          </p>
          <div className="bg-background flex gap-4 text-foreground border shadow-xl  border-border p-2 rounded-lg my-3 font-mono  break-all">
            <span className="flex-1 min-w-0 truncate">{apiKey}</span>
            <CopyButton text={apiKey} />{" "}
          </div>
          <p className="text-sm text-foreground">
            Status: {isEnabled ? "✅ Enabled" : "❌ Disabled"}
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 text-white shadow shadow-blue-950/55   hover:animate-pulse px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Regenerate Key"}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm bg-background  text-green-400  border-border mb-3">
            You don&apos;t have an API key yet. Generate one to use the REST
            API.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 text-white  shadow shadow-blue-950/55   hover:animate-pulse px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Generate API Key"}
          </button>
        </div>
      )}
    </div>
  );
}
