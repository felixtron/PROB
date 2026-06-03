"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Container from "@/components/landing/ui/Container";
import JazzyAurora from "@/components/landing/ui/JazzyAurora";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

function CreditItem({ role, name }: { role: string; name: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[7px] md:text-[8px] uppercase tracking-[0.4em] text-gold/60 font-light mb-1">{role}</span>
      <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-ivory font-bold">{name}</span>
    </div>
  );
}


export default function CinemaSection() {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = "5GGO5SwNPWY";
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <section id="video" className="py-32 md:py-48 bg-noir relative border-y border-white/5 overflow-x-clip z-20">
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      <JazzyAurora />
      <JazzyDecorations />
      
      {/* ── Framing Lines ── */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      {/* ── MAIN CONTENT ── */}
      <Container className="relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold/40 text-[9px] md:text-[10px] tracking-[1.5em] uppercase mb-8 block font-black">Official Release</span>
            <h2 className="jazzy-title text-7xl md:text-9xl lg:text-[12vw] text-ivory leading-[0.8] mb-8">
              Único
            </h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-ivory/60 text-lg md:text-2xl font-serif italic leading-relaxed">
                {"\"Lo verdaderamente especial no se repite... solo se siente, se vive y se atesora.\""}
              </p>
              <div className="w-12 h-px bg-gold/20 mx-auto" />
            </div>
          </motion.div>
        </div>

        {/* Video Thumbnail – Full Width Premium */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative aspect-video w-full max-w-6xl mx-auto rounded-[24px] lg:rounded-[40px] overflow-hidden 
                     shadow-[0_30px_100px_rgba(0,0,0,0.8)] lg:shadow-[0_60px_200px_rgba(0,0,0,0.8)] 
                     border border-gold/10 group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Image
            src={thumbnailUrl}
            alt="Priscilla Castro – Único"
            fill
            className="object-cover brightness-[0.55] lg:group-hover:brightness-[0.75] lg:group-hover:scale-[1.02] transition-all duration-1000"
            sizes="(max-width: 1024px) 100vw, 1152px"
            quality={80}
            priority
          />
          {/* Golden vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.04)_0%,transparent_70%)] hidden lg:block" />

          {/* Play Button – Large & Premium */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full 
                              border border-gold/30 bg-black/40 backdrop-blur-md
                              flex items-center justify-center
                              lg:group-hover:border-gold lg:group-hover:bg-gold/10
                              transition-all duration-500 shadow-[0_0_50px_rgba(197,160,89,0.2)]">
                <div className="w-0 h-0 
                                border-t-[10px] border-t-transparent 
                                border-l-[18px] border-l-gold 
                                border-b-[10px] border-b-transparent 
                                ml-2
                                lg:group-hover:border-l-white transition-colors duration-500" />
              </div>
            </motion.div>
          </div>

          {/* Credits Bar Overlay - Subtle Fashion Look */}
          <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black via-black/40 to-transparent justify-between items-end gap-6 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700 hidden lg:flex">
            <div className="text-left space-y-2">
              <span className="text-gold text-[8px] uppercase tracking-[0.5em] font-black">Escrita por</span>
              <p className="text-ivory text-sm font-serif italic tracking-wide">Priscilla Castro & Joel Castro</p>
            </div>
            <div className="text-right space-y-2">
              <span className="text-gold text-[8px] uppercase tracking-[0.5em] font-black">Video Film</span>
              <p className="text-ivory text-sm font-serif italic tracking-wide">One Love Studios</p>
            </div>
          </div>
          {/* Top right label */}
          <div className="absolute top-8 right-8 lg:top-12 lg:right-12">
            <span className="text-gold/60 text-[9px] uppercase tracking-[0.5em]">Click para ver</span>
          </div>
        </motion.div>

        {/* Movie Poster Credits - Billing Block Style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24 max-w-4xl mx-auto px-4"
        >
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-center">
            <CreditItem role="Letra & Composición" name="Priscilla Castro" />
            <CreditItem role="Música" name="Joel Castro" />
            <CreditItem role="Co-Producción" name="Christian Balderas & Isaac Mora" />
            <CreditItem role="Mezcla & Master" name="Dano Martínez & Isaí Araujo" />
            <CreditItem role="Video Film" name="One Love Studios" />
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-40">
            <span className="text-[7px] uppercase tracking-[0.3em] text-ivory">Batería: Hiram Griss</span>
            <span className="text-[7px] uppercase tracking-[0.3em] text-ivory">Bajo: Plon</span>
            <span className="text-[7px] uppercase tracking-[0.3em] text-ivory">Guitarra: Gerardo Porras</span>
            <span className="text-[7px] uppercase tracking-[0.3em] text-ivory">Percusión: Isaac Mora</span>
            <span className="text-[7px] uppercase tracking-[0.3em] text-ivory">Maquillaje: Darien Schatz</span>
          </div>
          
          <div className="mt-12 flex justify-center opacity-20">
            <div className="w-px h-12 bg-gold" />
          </div>
        </motion.div>
      </Container>

      {/* ────────────────────────────────────────
          FULLSCREEN VIDEO MODAL – PREMIUM SIZE
      ──────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[500] flex items-center justify-center overscroll-none touch-none"
            style={{ backgroundColor: "rgba(8,8,8,0.97)" }}
            onClick={() => setIsOpen(false)}
          >
            {/* Gradient backdrop glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(197,160,89,0.12)_0%,transparent_70%)] pointer-events-none" />

            {/* Close button - Improved visibility */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-[700]
                         px-6 py-3 rounded-full bg-black/60 border border-gold/40
                         text-gold flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] font-black
                         hover:bg-gold hover:text-noir transition-all duration-300"
            >
              <span>Cerrar</span>
              <span className="text-2xl font-light">×</span>
            </motion.button>

            {/* Video Container – 95vw × 95vh for maximum immersion */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-[550] flex flex-col rounded-[24px] md:rounded-[32px] overflow-hidden
                         border border-gold/20 shadow-[0_0_120px_rgba(197,160,89,0.25)]
                         bg-[#080808]"
              style={{ width: "95vw", height: "95vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Bar */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-gold/10 bg-noir/90 backdrop-blur-sm shrink-0">
                <div>
                  <h3 className="text-ivory font-serif italic text-xl md:text-2xl">
                    Priscilla Castro — Único
                  </h3>
                  <p className="text-gold/50 text-[9px] md:text-[10px] tracking-[0.4em] uppercase mt-1">
                    Official Music Video · Directed by One Love Studios
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-ivory/30 hover:text-gold transition-colors duration-200 text-2xl font-light leading-none"
                >
                  ×
                </button>
              </div>

              {/* YouTube iframe – fills remaining space */}
              <div className="flex-1 relative bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&color=white&modestbranding=1&rel=0`}
                  title="Priscilla Castro – Live Performance"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
