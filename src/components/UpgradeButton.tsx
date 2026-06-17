"use client";

import Link from "next/link";
import { useState } from "react";

export default function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button disabled={isLoading} onClick={() => setIsLoading(true)}>
      <Link
        href={"/pricing"}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2  shadow shadow-blue-950/55 rounded-lg hover:animate-pulse
      transition-all disabled:opacity-50"
      >
        {isLoading ? " loading..." : "upgrade to Pro"}
      </Link>
    </button>
  );
}
