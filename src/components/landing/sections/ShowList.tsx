"use client";

import { motion } from "framer-motion";
import Container from "@/components/landing/ui/Container";
import JazzyAurora from "@/components/landing/ui/JazzyAurora";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

export default function ShowList() {
  return (
    <section id="fechas" className="py-24 bg-noir relative border-t border-gold/10 overflow-x-clip">
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      <JazzyAurora className="opacity-30" />
      <JazzyDecorations />
      <Container>
        <div className="text-center mb-16">
          <h3 className="font-marcellus text-4xl md:text-6xl text-gold uppercase tracking-[0.4em]">
            Próximos <span className="italic">Shows</span>
          </h3>
          <p className="text-ivory/20 text-[9px] uppercase tracking-[0.5em] mt-4">Sesiones Exclusivas 2026</p>
        </div>

        <div className="max-w-4xl mx-auto border-y border-gold/10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.04] transition-colors duration-500 hidden md:block left-1/2 -translate-x-1/2 w-screen" />

            <div className="relative flex flex-col md:flex-row md:items-center py-8 px-2 gap-6 md:gap-12">

              {/* Date */}
              <div className="flex-shrink-0">
                <span className="text-gold font-serif text-2xl md:text-3xl tracking-widest uppercase">20 Mayo</span>
              </div>

              {/* Venue */}
              <div className="flex-1">
                <h4 className="text-base md:text-xl text-ivory/90 uppercase tracking-[0.25em] font-marcellus group-hover:text-gold transition-colors">
                  Zinco Jazzclub
                </h4>
                <p className="text-[9px] md:text-[10px] text-ivory/40 uppercase tracking-widest font-light mt-1">
                  Ciudad de México
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {/* Reserva phone */}
                <a
                  href="tel:5511317760"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 text-gold text-[9px] font-black uppercase tracking-widest hover:border-gold hover:bg-gold/10 transition-all duration-300"
                >
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                  </svg>
                  55 1131 7760
                </a>

                {/* Maps */}
                <a
                  href="https://maps.app.goo.gl/4s57tRvDwrdGERHY9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-noir text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.3)]"
                >
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Cómo llegar
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
