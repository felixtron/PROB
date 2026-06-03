"use client";

import { useState, useEffect } from "react";

export default function SpotifyWaveCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) return <div className="absolute inset-0 bg-noir" />;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Spotify Green Aurora (Subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,185,84,0.1)_0%,transparent_70%)] animate-spotify-aurora" />
      
      {/* Animated Lines instead of Video (Hardware Accelerated scaleY) */}
      <div className="absolute inset-0 flex items-center justify-around opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-32 bg-[#1DB954]/40 rounded-full animate-spotify-bar origin-center optimize-gpu"
            style={{ 
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${1.5 + (i % 3) * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Visual gradients for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(8,8,8,0.9)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(29,185,84,0.03)_0%,transparent_50%)]" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-noir to-transparent" />
    </div>
  );
}
