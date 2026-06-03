"use client";

export default function JazzyDecorations() {
  return (
    <div 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* MOBILE ONLY: Simple premium flat radial gradient (Immediate CSS loading) */}
      <div className="block lg:hidden absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.08)_0%,transparent_70%)]" />
      </div>

      {/* DESKTOP ONLY: High-performance elegant layers (Hardware Accelerated) */}
      <div className="hidden lg:block absolute inset-0 optimize-gpu">
        {/* ── NATIVE CSS AURORA (Single optimized light blob per section) ── */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-15"
               style={{
                 background: "radial-gradient(circle at center, rgba(197, 160, 89, 0.2) 0%, transparent 70%)",
                 transform: "translateZ(0)"
               }} />
        </div>

        {/* ── JAZZY GRID (Discrete and elegant) ── */}
        <div className="jazzy-grid opacity-12" />

        {/* ── SINGLE DISCRETE GEOMETRIC OUTLINE (Static for performance, highly elegant) ── */}
        <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[50vh] border border-gold/10 rounded-[100px]"
             style={{ transform: "rotate(15deg) translateZ(0)" }} />

        {/* ── ART DECO ABANICO WATERMARK (Static, premium, high-end editorial look) ── */}
        <div className="absolute top-[15%] -right-16 opacity-[0.08] scale-[2.2] rotate-12"
             style={{ transform: "translateZ(0)" }}>
          <FanPattern />
        </div>
      </div>
    </div>
  );
}

function FanPattern() {
  return (
    <svg width="300" height="150" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
      <path d="M120 120C53.7258 120 0 66.2742 0 0" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 6"/>
      <path d="M120 120C77.7258 120 48 91.2742 48 48" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M120 120C186.274 120 240 66.2742 240 0" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 6"/>
      <path d="M120 120C162.274 120 192 91.2742 192 48" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="120" cy="120" r="15" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      <path d="M120 120L60 60M120 120L180 60M120 120V40" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
    </svg>
  );
}
