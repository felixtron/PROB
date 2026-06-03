"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Container from "@/components/landing/ui/Container";
import JazzyAurora from "@/components/landing/ui/JazzyAurora";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

interface EditorialImage {
  src: string;
  position?: string;
  rotate?: string;
}

interface EditorialItem {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  image: EditorialImage[] | string;
  position: string;
}

const content: EditorialItem[] = [
  {
    id: "02",
    title: "ESTELAR",
    subtitle: "Corista Principal",
    desc: "Su talento vocal la ha llevado a compartir el escenario internacional como corista de Yuri, Cristian Castro, Edith Márquez y Mijares Sinfónico.",
    image: [
      { src: "/Fotos con artistas/yuri.JPG", position: "center 20%" },
      { src: "/Fotos con artistas/IMG_3081.webp", position: "left center" },
      { src: "/Fotos con artistas/IMG_4891.webp", position: "center 20%", rotate: "90deg" },
      { src: "/Fotos con artistas/IMG_0878.JPG", position: "center 20%" },
      { src: "/Fotos con artistas/490386796_9526064290764052_4535570557805440303_n.jpg", position: "center 20%" },
      { src: "/Fotos con artistas/500421463_18504019597008689_8836020721736324073_n.jpg", position: "center 20%" }
    ],
    position: "center 20%"
  },
];

function GatsbyFrame() {
  return (
    <div className="absolute -inset-12 pointer-events-none z-10 hidden md:block">
      {/* 4 Borders with Gatsby Pattern */}
      <div className="absolute top-0 left-0 right-0 h-10 text-gold/40 overflow-hidden">
        <svg width="100%" height="40">
          <defs>
            <pattern id="gatsby-pattern-top" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 H60 M30 0 V60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <path d="M10 10 L20 20 M40 40 L50 50 M50 10 L40 20 M20 40 L10 50" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="25" y="25" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="40" fill="url(#gatsby-pattern-top)" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 text-gold/40 overflow-hidden">
        <svg width="100%" height="40">
          <defs>
            <pattern id="gatsby-pattern-bottom" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 H60 M30 0 V60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <path d="M10 10 L20 20 M40 40 L50 50 M50 10 L40 20 M20 40 L10 50" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="25" y="25" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="40" fill="url(#gatsby-pattern-bottom)" />
        </svg>
      </div>

      <div className="absolute top-10 bottom-10 left-0 w-10 text-gold/40 overflow-hidden">
        <svg width="40" height="100%">
          <defs>
            <pattern id="gatsby-pattern-left" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 H60 M30 0 V60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <path d="M10 10 L20 20 M40 40 L50 50 M50 10 L40 20 M20 40 L10 50" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="25" y="25" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="40" height="100%" fill="url(#gatsby-pattern-left)" />
        </svg>
      </div>

      <div className="absolute top-10 bottom-10 right-0 w-10 text-gold/40 overflow-hidden">
        <svg width="40" height="100%">
          <defs>
            <pattern id="gatsby-pattern-right" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 H60 M30 0 V60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <path d="M10 10 L20 20 M40 40 L50 50 M50 10 L40 20 M20 40 L10 50" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="25" y="25" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="40" height="100%" fill="url(#gatsby-pattern-right)" />
        </svg>
      </div>

      {/* Structural Lines */}
      <div className="absolute inset-[5px] border-2 border-gold/40" />
      <div className="absolute inset-[35px] border border-gold/20 opacity-50" />

      {/* 4 Corner Ornaments */}
      <svg width="60" height="60" viewBox="0 0 60 60" className="absolute top-0 left-0 text-gold/40">
        <path d="M0 60 V0 H60" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>

      <svg width="60" height="60" viewBox="0 0 60 60" className="absolute top-0 right-0 text-gold/40">
        <path d="M0 0 H60 V60" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>

      <svg width="60" height="60" viewBox="0 0 60 60" className="absolute bottom-0 left-0 text-gold/40">
        <path d="M0 0 V60 H60" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>

      <svg width="60" height="60" viewBox="0 0 60 60" className="absolute bottom-0 right-0 text-gold/40">
        <path d="M60 60 V0 H0" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    </div>
  );
}

function Slideshow({ images, position }: { images: EditorialImage[], position: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const currentImage = images[index];
  const imageSrc = typeof currentImage === 'string' ? currentImage : currentImage.src;
  const imagePosition = typeof currentImage === 'string' ? position : (currentImage.position || position);
  const imageRotate = typeof currentImage === 'string' ? "0deg" : (currentImage.rotate || "0deg");

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div 
            className="relative w-full h-full overflow-hidden"
            style={{ transform: `rotate(${imageRotate})` }}
          >
            <Image
              src={imageSrc}
              alt="Slideshow"
              fill
              priority={index === 0}
              quality={80}
              className="object-cover contrast-[1.05] brightness-90"
              style={{ objectPosition: imagePosition }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EditorialSection({ item, index, isMobile }: { item: EditorialItem; index: number; isMobile: boolean }) {
  const isEven = index % 2 === 0;
  const isSlideshow = Array.isArray(item.image);
  
  return (
    <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 md:gap-24`}>
      {/* Image Section - Large & Dynamic */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-[55%] relative aspect-[4/3] group"
      >
        {/* Gatsby Frame Detail */}
        <GatsbyFrame />
        
        <div className="relative w-full h-full overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] border border-gold/20 bg-noir">
          {isSlideshow ? (
            <Slideshow images={item.image as EditorialImage[]} position={item.position} />
          ) : (
            <Image
              src={item.image as string}
              alt={item.title}
              fill
              priority={index === 0}
              quality={80}
              className="object-cover contrast-[1.05] brightness-90 group-hover:scale-105 transition-transform duration-[4s] ease-out"
              style={{ objectPosition: item.position }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            />
          )}
          {/* Subtle Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-noir/40 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>
      </motion.div>

      {/* Content Section - Jazzy Editorial */}
      <motion.div 
        initial={{ opacity: 0, x: isMobile ? 0 : (isEven ? 40 : -40) }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full md:w-[40%] flex flex-col justify-center text-left"
      >
        <div className="space-y-8 relative">
          {/* Aesthetic Divider Line */}
          <div className="w-16 h-px bg-gradient-to-r from-gold/40 to-transparent" />
          
          {/* Headline Stack */}
          <div className="space-y-3">
            <h3 className="text-5xl md:text-6xl lg:text-7xl font-serif text-ivory tracking-tighter leading-[0.9] italic">
              {item.title}
            </h3>
            <p className="text-gold font-serif text-xl md:text-2xl tracking-wide opacity-90 italic">
              {item.subtitle}
            </p>
          </div>

          <p className="text-ivory/40 text-lg md:text-xl font-light leading-relaxed max-w-md">
            {item.desc}
          </p>

          {/* Dynamic Link */}
          <motion.div 
            whileHover={{ x: 15 }}
            className="inline-flex items-center gap-6 text-gold/40 text-[10px] uppercase tracking-[0.4em] font-black cursor-pointer group"
          >
            <span className="group-hover:text-gold transition-colors">Explore Legacy</span>
            <div className="w-12 h-px bg-gold/20 group-hover:w-20 group-hover:bg-gold transition-all duration-500" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function EditorialReveal() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section id="bio" className="py-32 md:py-48 bg-noir relative overflow-x-clip">
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      <JazzyAurora />
      <JazzyDecorations />
      
      <Container className="relative z-10">
        <div className="flex flex-col gap-48 md:gap-72">
          {content.map((item, i) => (
            <EditorialSection key={item.id} item={item} index={i} isMobile={isMobile} />
          ))}
        </div>
      </Container>
    </section>
  );
}
