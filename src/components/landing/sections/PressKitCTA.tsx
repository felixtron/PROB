"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/landing/ui/Container";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

interface ShowFormat {
  title: string;
  image: string;
  desc: string;
  videoUrl?: string;
  cotizarSlug?: string;
}

function ShowFormatCard({ 
  format, 
  i, 
  onPlay
}: { 
  format: ShowFormat; 
  i: number; 
  onPlay?: (url: string) => void;
}) {
  const hasVideo = !!format.videoUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: i * 0.15 }}
      className="group relative flex flex-col gap-4"
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/10 shadow-2xl bg-noir ${hasVideo ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (hasVideo && format.videoUrl && onPlay) {
            onPlay(format.videoUrl);
          }
        }}
      >
        <Image
            src={format.image}
            alt={format.title}
            fill
            className="object-cover transition-transform duration-700 brightness-75 group-hover:scale-110"
            sizes="(max-width: 768px) 85vw, 200px"
            quality={55}
          />

        {/* Subtle Play indicator for cards with video (perfect for mobile discoverability) */}
        {hasVideo && (
          <div className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full border border-gold/30 bg-noir/80 backdrop-blur-sm flex items-center justify-center text-gold shadow-[0_0_15px_rgba(197,160,89,0.2)] transition-all duration-300 md:group-hover:scale-0 md:group-hover:opacity-0">
            <Play className="w-3.5 h-3.5 fill-gold/20 ml-0.5 animate-pulse" />
          </div>
        )}

        {/* Hover video play button overlay */}
        {hasVideo && (
          <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center z-20">
            <div className="w-14 h-14 rounded-full border border-gold/60 flex items-center justify-center text-gold bg-noir/80 shadow-[0_0_30px_rgba(197,160,89,0.3)] transform scale-90 md:group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 fill-gold/20 ml-1" />
            </div>
            <span className="text-gold text-[9px] font-black uppercase tracking-[0.3em] mt-4 opacity-0 md:group-hover:opacity-100 transition-all duration-300 delay-75">
              Ver Video
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute bottom-6 left-6 right-6 text-left pointer-events-none z-30">
          <h3 className="text-2xl font-serif text-ivory mb-1 italic">{format.title}</h3>
          <p className="text-gold/60 text-[10px] uppercase tracking-widest">{format.desc}</p>
        </div>
      </div>

      {/* Funnel CTA — debajo de la card para no tapar el título ni el preview de video.
          Pre-selecciona el paquete en /cotizar. */}
      <Link
        href={format.cotizarSlug ? `/cotizar?package=${format.cotizarSlug}` : "/cotizar"}
        aria-label={`Cotizar ${format.title}`}
        className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-full bg-gold text-noir text-[10px] font-black uppercase tracking-[0.18em] shadow-[0_8px_24px_rgba(197,160,89,0.35)] hover:scale-[1.02] hover:bg-gold/90 transition-all duration-300"
      >
        Cotizar {format.title}
        <span aria-hidden className="text-[12px]">→</span>
      </Link>
    </motion.div>
  );
}

export default function PressKitCTA() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Lock body scroll when video is active
  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  return (
    <section id="contrataciones" className="relative py-32 md:py-48 bg-noir border-t border-white/5 overflow-x-clip">
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      
      <JazzyDecorations />
      
      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center gap-12 md:gap-16 max-w-4xl mx-auto">

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="deco-title text-[10px] md:text-xs tracking-[2em] uppercase text-gold/60"
          >
            Booking & Management
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="jazzy-title text-6xl md:text-8xl lg:text-9xl text-ivory leading-[0.8] mb-4"
          >
            Contrata el <br />
            <span className="italic text-gold font-serif tracking-normal not-uppercase">
              Show
            </span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent origin-center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
            {[
              {
                title: "Essence Duo",
                image: "/Fotos Dueto/dueto.webp",
                desc: "Voz y Piano / Guitarra",
                videoUrl: "https://www.youtube.com/embed/JMH-DxvdVwo?autoplay=1",
                cotizarSlug: "essence-duo"
              },
              {
                title: "Signature Trio",
                image: "/Fotos trio/Trio foto.webp",
                desc: "Piano, Percusión y Voz",
                videoUrl: "https://www.youtube.com/embed/IFqnbhnn3sk?autoplay=1",
                cotizarSlug: "signature-trio"
              },
              {
                title: "Luxury Band",
                image: "/Fotos banda/pris full band.webp",
                desc: "Show Funk, Soul y Disco",
                videoUrl: "https://www.youtube.com/embed/zz3doIqjwtM?autoplay=1",
                cotizarSlug: "luxury-band"
              },
            ].map((format, i) => (
              <ShowFormatCard 
                key={format.title} 
                format={format} 
                i={i} 
                onPlay={setActiveVideo}
              />
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-ivory/40 text-lg md:text-xl font-light leading-relaxed max-w-2xl"
          >
            Disponibilidad para eventos privados, festivales de jazz, recintos culturales
            y colaboraciones especiales. Cada formato ofrece una atmósfera única
            adaptada a la elegancia de su evento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <a
              href="https://wa.me/525511349497"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-full
                         bg-gold text-noir font-black uppercase tracking-widest text-[11px]
                         shadow-[0_0_50px_rgba(197,160,89,0.35)]
                         hover:shadow-[0_0_80px_rgba(197,160,89,0.6)]
                         hover:scale-105 transition-all duration-500"
            >
              <WhatsAppIconSmall className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
              Contratar ahora
            </a>
          </motion.div>
        </div>
      </Container>

      {/* Premium Video Lightbox Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setActiveVideo(null)}
          >
            {/* Modal Container with 9:16 Aspect Ratio */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[360px] xs:max-w-[400px] aspect-[9/16] bg-noir rounded-2xl overflow-hidden border border-gold/20 shadow-[0_0_50px_rgba(197,160,89,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Premium style-matched close button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-[110] p-2.5 rounded-full bg-noir/80 border border-gold/20 text-gold hover:text-white hover:border-gold hover:bg-gold/20 transition-all duration-300 shadow-lg cursor-pointer"
                aria-label="Cerrar video"
              >
                <X className="w-4 h-4" />
              </button>

              {/* YouTube player */}
              <div className="w-full h-full">
                <iframe
                  src={`${activeVideo}&enablejsapi=1&rel=0`}
                  title="YouTube Short"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function WhatsAppIconSmall({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
