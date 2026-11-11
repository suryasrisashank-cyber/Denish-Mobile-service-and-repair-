import React from "react";
import DenishApp from "@/components/DenishApp";

export default function Home() {
  return (
    <main className="relative min-h-screen antialiased overflow-x-hidden selection:bg-amber-500/20 selection:text-amber-600 pb-24 sm:pb-0">
      {/* ── DENISH INTERACTIVE MOBILE REPAIR APPLICATION ── */}
      <div className="relative z-10 min-h-screen">
        <DenishApp />
      </div>
    </main>
  );
}