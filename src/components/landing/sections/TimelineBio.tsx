"use client";

import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import Image from "next/image";
import Container from "@/components/landing/ui/Container";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

const timelineData = [
  {
    year: "1995",
    title: "Raíces & Inicio",
    location: "Costa Rica",
    description: "Nacida el 22 de marzo en Costa Rica, Priscilla inició su carrera profesional a los 20 años en musicales de teatro, debutando en el prestigioso Teatro Melico Salazar en 2015.",
    image: "/raices.jpg"
  },
  {
    year: "2015 - 2022",
    title: "La Consolidación Sinfónica",
    location: "San José",
    description: "Se consolidó como una de las artistas más destacadas de la Orquesta Filarmónica de Costa Rica y la Orquesta Universal, participando como cantante principal en importantes conciertos y eventos del país.",
    image: "/Fotos con las orquestas/FOTO-80.webp"
  },
  {
    year: "2023",
    title: "El Horizonte Mexicano",
    location: "Ciudad de México",
    description: "Decidió expandir su carrera a México, comenzando como corista de Daniela Romo y siendo invitada a interpretar a dueto 'La ocasión para amarnos' durante la Gira Abraza la Vida.",
    image: "/pro castro 2.webp"
  },
  {
    year: "2024",
    title: "Escenarios Compartidos",
    location: "Gira Internacional",
    description: "Se unió como corista de Yuri & Cristian Castro en la gira 'Unidos en el Escenario'. Actualmente participa como corista principal de Edith Márquez y en Mijares Sinfónico.",
    image: "/Fotos con artistas/yuri.JPG"
  },
  {
    year: "2024",
    title: "Dueto Inolvidable",
    location: "Highlight",
    description: "Un highlight en su trayectoria: compartir escenario y voces con la legendaria Daniela Romo, creando un momento mágico que reafirma su lugar como una de las voces más prometedoras de México.",
    image: "/Fotos con artistas/IMG_0878.JPG",
    videoUrl: "https://www.youtube.com/embed/jqf9Rwy24oo?autoplay=1"
  },
  {
    year: "Actualidad",
    title: "La Voz de la Elegancia",
    location: "Zinco Jazz Club",
    description: "Como solista, ha desarrollado una propuesta elegante dentro de la escena de la CDMX, presentando tributos a Sade, Nina Simone y Aretha Franklin en recintos icónicos como el Zinco Jazz Club.",
    image: "/pri castro dorado.webp"
  }
];

export default function TimelineBio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

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

  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    // By using "start center" and "end center", the progress maps exactly to when
    // the container is fully passing through the middle of the viewport.
    offset: ["start center", "end center"] 
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate note position based on the same progress
  const noteY = useTransform(scaleY, [0, 1], ["0%", "100%"]);

  if (!mounted) return null;

  return (
    <section id="trayectoria" ref={containerRef} className="relative py-32 bg-noir overflow-x-clip">
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      
      {/* ── BACKGROUND ATMOSPHERE (Optimized) ── */}
      <JazzyDecorations />
      
      <Container className="relative z-10">
        <div className="mb-32 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.5, y: 0 }}
            className="text-gold font-deco text-xs tracking-[1.5em] uppercase block mb-4"
          >
            Musical Journey
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="jazzy-title text-6xl md:text-8xl text-ivory italic leading-none"
          >
            Nuestra <span className="text-gold not-italic">Voz</span>
          </motion.h2>
        </div>

        {/* Vertical Timeline Structure */}
        <div ref={contentRef} className="relative max-w-6xl mx-auto">
          {/* Central Progress Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gold/10 hidden md:block">
            <motion.div 
              style={{ scaleY, originY: 0 }}
              className="absolute inset-0 w-full bg-gold shadow-[0_0_15px_rgba(197,160,89,0.5)]"
            />
            {/* Moving Music Note */}
            <motion.div 
              style={{ top: noteY }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-gold"
            >
              <MusicNoteIcon className="w-10 h-10 drop-shadow-[0_0_10px_rgba(197,160,89,1)] bg-noir rounded-full p-1" />
            </motion.div>
          </div>

          <div className="space-y-32 md:space-y-64">
            {timelineData.map((item, index) => (
              <TimelineItem 
                key={index} 
                item={item} 
                index={index} 
                onPlay={setActiveVideo}
              />
            ))}
          </div>
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
            {/* Modal Container with 16:9 Aspect Ratio (horizontal video) */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[800px] aspect-video bg-noir rounded-2xl overflow-hidden border border-gold/20 shadow-[0_0_50px_rgba(197,160,89,0.3)]"
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
                  title="YouTube Video"
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

interface TimelineItemType {
  year: string;
  title: string;
  location: string;
  description: string;
  image: string;
  videoUrl?: string;
}

function TimelineItem({ item, index, onPlay }: { item: TimelineItemType, index: number, onPlay?: (url: string) => void }) {
  const isEven = index % 2 === 0;
  const hasVideo = !!item.videoUrl;

  return (
    <div className={`relative flex flex-col md:flex-row items-center gap-12 md:gap-24 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      {/* Connector Node */}
      <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-gold bg-noir z-10 hidden md:block" />

      {/* Image Block */}
      <motion.div 
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className={`w-full md:w-1/2 group ${hasVideo ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (hasVideo && item.videoUrl && onPlay) {
            onPlay(item.videoUrl);
          }
        }}
      >
        <div className="relative aspect-[4/5] md:aspect-square rounded-[40px] overflow-hidden shadow-2xl border border-gold/10">
          <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 85vw, 606px"
              quality={55}
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

          {/* Hover video play button overlay (Desktop) */}
          {hasVideo && (
            <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex-col items-center justify-center z-20 hidden md:flex">
              <div className="w-16 h-16 rounded-full border border-gold/60 flex items-center justify-center text-gold bg-noir/80 shadow-[0_0_30px_rgba(197,160,89,0.3)] transform scale-90 md:group-hover:scale-100 transition-transform duration-300">
                <Play className="w-6 h-6 fill-gold/20 ml-1" />
              </div>
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-0 md:group-hover:opacity-100 transition-all duration-300 delay-75">
                Ver Video
              </span>
            </div>
          )}

          {/* Mobile Play indicator */}
          {hasVideo && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full border border-gold/30 bg-noir/60 backdrop-blur-sm items-center justify-center text-gold shadow-[0_0_20px_rgba(197,160,89,0.3)] flex md:hidden">
              <Play className="w-6 h-6 fill-gold/20 ml-1 animate-pulse" />
            </div>
          )}
          
          <div className="absolute top-4 left-4 md:top-12 md:left-12 bg-gold text-noir px-3 py-1 md:px-6 md:py-2 rounded-full font-serif italic text-sm md:text-xl shadow-xl z-40">
            {item.year}
          </div>
        </div>
      </motion.div>

      {/* Content Block */}
      <motion.div 
        initial={{ opacity: 0, x: isEven ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
        className="w-full md:w-1/2 space-y-6 text-center md:text-left"
      >
        <div className="flex flex-col md:flex-row items-center md:items-end gap-3 text-gold">
          <span className="font-deco text-xs tracking-[0.5em] uppercase opacity-60">{item.location}</span>
          <div className="h-px w-16 bg-gold/30 hidden md:block" />
        </div>
        <h3 className="text-4xl md:text-6xl font-serif text-ivory leading-tight drop-shadow-lg">
          {item.title}
        </h3>
        <p className="text-ivory/50 text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto md:mx-0 border-t md:border-t-0 md:border-l border-gold/20 pt-6 md:pt-0 md:pl-8">
          {item.description}
        </p>
      </motion.div>
    </div>
  );
}

function MusicNoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );
}
