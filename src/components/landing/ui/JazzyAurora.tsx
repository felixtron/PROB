"use client";

export default function JazzyAurora({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className || ""}`}>
      {/* MOBILE ONLY: High-performance flat radial gradient (Immediate CSS loading) */}
      <div className="block lg:hidden absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_70%)]" />
      </div>

      {/* DESKTOP ONLY: Dynamic animating blobs (Immediate CSS loading) */}
      <div className="hidden lg:block absolute inset-0">
        <div className="aurora-container w-full h-full">
          <div className="aurora-blob aurora-1" />
          <div className="aurora-blob aurora-2" />
          <div className="aurora-blob aurora-3" />
        </div>
      </div>
    </div>
  );
}
