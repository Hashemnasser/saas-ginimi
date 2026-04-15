"use client";

import { generateApiKey } from "@/lib/actions";
import { useState } from "react";
import { toast } from "sonner";

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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your secret API key. <strong>Keep it safe!</strong> It will not be
            shown again.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded my-3 font-mono text-sm break-all">
            {apiKey}
          </div>
          <p className="text-sm text-gray-500">
            Status: {isEnabled ? "✅ Enabled" : "❌ Disabled"}
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-secondary mt-3"
          >
            {loading ? "Generating..." : "Regenerate Key"}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            You don't have an API key yet. Generate one to use the REST API.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Generating..." : "Generate API Key"}
          </button>
        </div>
      )}
    </div>
  );
}
