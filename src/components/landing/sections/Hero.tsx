"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import JazzyAurora from "@/components/landing/ui/JazzyAurora";

export default function Hero() {
  return (
    <section
      className="relative h-screen h-[100dvh] w-full bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      <JazzyAurora />
      
      {/* Cinematic Background — GPU-only scale animation */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 w-full h-[115%]"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 8, ease: "easeOut" }}
          style={{ willChange: "transform" }}
        >
          <Image
            src="/hero.webp"
            alt="Priscilla Castro"
            fill
            className="object-cover object-top lg:object-center brightness-[0.7] contrast-[1.1]"
            priority
            sizes="100vw"
          />
        </motion.div>
        {/* Warm Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.15)_0%,transparent_70%)]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center w-full px-6 translate-y-[14rem] lg:translate-y-[12vh]"
      >
        <div className="w-[55vw] md:w-[40vw] max-w-[520px] mx-auto">
            <Image
              src="/logo.png"
              alt="Priscilla Castro Logo"
              width={680}
              height={340}
              quality={60}
              priority
              fetchPriority="high"
              loading="eager"
              sizes="(max-width: 768px) 60vw, 400px"
              className="w-full h-auto object-contain brightness-0 invert drop-shadow-[0_0_60px_rgba(197,160,89,0.3)]"
            />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex-col items-center gap-8 hidden lg:flex"
      >
        <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
      </motion.div>

      <div className="section-fade-bottom" />

      {/* Jazzy Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 bg-black">
          <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_15px_rgba(197,160,89,1)]" />
        </div>
      </div>
    </section>
  );
}
