import React, { Suspense } from "react";
import { SharePageClient } from "./SharePageClient";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";
import { Loader2 } from "lucide-react";

function SharePageLoading() {
  return (
    <div className="min-h-screen bg-[#070a14] flex flex-col items-center justify-center text-slate-300 gap-4">
      <SeleneTitanLogo className="w-12 h-12 animate-pulse" />
      <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Decrypting Selene Cloud Document...</span>
      </div>
    </div>
  );
}

export default function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SharePageLoading />}>
      <SharePageClient params={params} />
    </Suspense>
  );
}
