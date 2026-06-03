"use client";

import { motion } from "framer-motion";

export default function JazzPosterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Geometric Yellow Blocks - Very Faint */}
      <motion.div 
        initial={{ x: "100%", opacity: 0 }}
        whileInView={{ x: "70%", opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 right-0 w-full h-[60%] bg-gold/5 -rotate-12 origin-top-right translate-y-[-10%]"
      />
      
      <motion.div 
        initial={{ x: "-100%", opacity: 0 }}
        whileInView={{ x: "-60%", opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="absolute bottom-0 left-0 w-full h-[40%] bg-gold/[0.03] rotate-12 origin-bottom-left translate-y-[20%]"
      />

      {/* Stylized Saxophone - Faint & Minimal */}
      <motion.svg
        viewBox="0 0 200 400"
        className="absolute top-[10%] right-[-5%] w-[40%] h-auto opacity-[0.04]"
        initial={{ opacity: 0, scale: 0.9, rotate: -25 }}
        whileInView={{ opacity: 0.05, scale: 1, rotate: -15 }}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        <path 
          d="M160,340 c-30,0 -55,-25 -55,-55 c0,-20 10,-35 25,-45 l0,-160 c0,-15 12,-28 28,-28 c15,0 28,12 28,28 l0,40 l-15,0 l0,-40 c0,-8 -6,-14 -14,-14 c-8,0 -14,6 -14,14 l0,165 c10,-5 20,-8 30,-8 c30,0 55,25 55,55 c0,30 -25,55 -55,55 z" 
          fill="currentColor" 
          className="text-gold"
        />
        <circle cx="130" cy="280" r="15" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold" />
        <circle cx="145" cy="300" r="10" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold" />
      </motion.svg>

      {/* Super 55 Microphone - Classic Vintage Style */}
      <motion.svg
        viewBox="0 0 100 200"
        className="absolute bottom-[5%] left-[2%] w-[25%] h-auto opacity-[0.03]"
        initial={{ opacity: 0, y: 50, rotate: 10 }}
        whileInView={{ opacity: 0.04, y: 0, rotate: 0 }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.4 }}
      >
        {/* Mic Head (Classic Shure 55 style) */}
        <path 
          d="M20,40 Q20,10 50,10 Q80,10 80,40 L80,100 Q80,130 50,130 Q20,130 20,100 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="text-gold"
        />
        {/* Horizontal Grille Lines */}
        {[50, 60, 70, 80, 90].map((y) => (
          <line key={y} x1="25" y1={y} x2="75" y2={y} stroke="currentColor" strokeWidth="1" className="text-gold" />
        ))}
        {/* Center Vertical Line */}
        <line x1="50" y1="10" x2="50" y2="130" stroke="currentColor" strokeWidth="1" className="text-gold opacity-50" />
        {/* Mic Base/Stem */}
        <path d="M45,130 L45,180 Q45,190 50,190 Q55,190 55,180 L55,130" fill="currentColor" className="text-gold" />
      </motion.svg>

      {/* Floating Jazz Lines - More Subtle */}
      <motion.div 
        animate={{ 
          x: [0, 40, 0],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[25%] left-[10%] w-24 h-[1px] bg-gold/40"
      />
      <motion.div 
        animate={{ 
          x: [0, -20, 0],
          opacity: [0.02, 0.05, 0.02]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[27%] left-[12%] w-36 h-[1px] bg-gold/20"
      />

      {/* Abstract Circles (Jazz Valves) - Extra Faint */}
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.03, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 1.5 }}
          className="absolute rounded-full border border-gold/40"
          style={{ 
            width: `${120 + i * 50}px`,
            height: `${120 + i * 50}px`,
            top: `${5 + i * 12}%`, 
            right: `${-10 + i * 3}%`,
            opacity: 0.02
          }}
        />
      ))}

      {/* Vertical Text - Extremely Subtle */}
      <div className="absolute top-[15%] left-4 flex flex-col gap-12 opacity-[0.015] select-none">
        <span className="jazzy-title text-9xl rotate-90 origin-left tracking-widest">SOUL</span>
        <span className="jazzy-title text-9xl rotate-90 origin-left tracking-widest">VOICE</span>
      </div>
    </div>
  );
}
