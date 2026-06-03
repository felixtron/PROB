"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";

// Section Components
import Hero from "@/components/landing/sections/Hero";
import EditorialReveal from "@/components/landing/sections/EditorialReveal";
import TimelineBio from "@/components/landing/sections/TimelineBio";
import ShowList from "@/components/landing/sections/ShowList";
import CinemaSection from "@/components/landing/sections/CinemaSection";
import PressKitCTA from "@/components/landing/sections/PressKitCTA";

// UI Components
import Container from "@/components/landing/ui/Container";
import SmoothScroll from "@/components/landing/ui/SmoothScroll";
import Navbar from "@/components/landing/ui/Navbar";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

const SpotifyWaveCanvas = dynamic(() => import("@/components/landing/ui/SpotifyWaveCanvas"), { ssr: false });

function DeferredSpotify({ src, height = "100%", title }: { src: string; height?: string | number; title: string }) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ height }} className="relative w-full overflow-hidden rounded-[24px]">
      {isInView ? (
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={title}
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-noir/60 flex items-center justify-center border border-white/5 rounded-[24px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-[#1DB954]/30 border-t-[#1DB954] animate-spin rounded-full" />
            <span className="text-[#1DB954]/40 text-[9px] uppercase tracking-widest">Cargando Spotify...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing-shell bg-noir relative min-h-screen selection:bg-gold selection:text-black">
      <SmoothScroll>
        <Navbar />
        
          <div id="inicio">
            <Hero />
          </div>
          
          <PressKitCTA />
          
          <EditorialReveal />
          
          <TimelineBio />

          {/* 5. DEDICATED SPOTIFY SECTION */}
          <section id="musica" className="py-32 md:py-64 relative bg-noir border-y border-white/5 overflow-x-clip">
            <div className="section-fade-top" />
            <div className="section-fade-bottom" />
            <JazzyDecorations />
            {/* Golden gradient backgrounds */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(197,160,89,0.12)_0%,rgba(8,8,8,0)_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(197,160,89,0.08)_0%,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            <SpotifyWaveCanvas />
            <Container className="relative z-10">
              <div className="text-center mb-24 md:mb-40">
                <span className="deco-title text-[10px] md:text-sm tracking-[0.8em] md:tracking-[2em] text-[#1DB954] mb-6 inline-block uppercase">Sound Archive</span>
                <h2 className="jazzy-title text-5xl md:text-8xl lg:text-[11vw] text-white">Priscilla <br /> <span className="text-[#1DB954] italic font-serif normal-case tracking-normal">Official Archive</span></h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }} 
                  className="glass-card !p-0 border-2 border-[#1DB954]/20 rounded-[32px] overflow-hidden bg-noir/40 backdrop-blur-xl max-w-lg mx-auto lg:mx-0"
                >
                  <div className="px-6 pt-6 pb-2">
                    <span className="text-[#1DB954] text-[9px] uppercase tracking-[0.5em] font-black">Artista</span>
                  </div>
                  <div className="relative h-[280px] md:h-[600px]">
                    <DeferredSpotify 
                      src="https://open.spotify.com/embed/artist/32DezRNmsBb4PU2kZiIzia?utm_source=generator&theme=0" 
                      title="Priscilla Castro Spotify Artist Profile"
                    />
                  </div>
                </motion.div>

                <div className="flex flex-col justify-center space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
                      Escucha la voz que <br /> <span className="text-gold italic">enamora</span> a Latinoamérica y el mundo.
                    </h3>
                    <p className="text-ivory/40 text-base md:text-lg font-light border-l border-[#1DB954]/40 pl-6 leading-relaxed">
                      Disponible en todas las plataformas. Su discografía combina la esencia del jazz clásico con toques contemporáneos de soul y R&B.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <span className="text-gold/60 text-[9px] uppercase tracking-[0.4em] font-black">Sencillo Destacado</span>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gold/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                      <div className="relative rounded-xl overflow-hidden">
                        <DeferredSpotify 
                          src="https://open.spotify.com/embed/track/7KiyahcRqJmftf4Vzwonaq?utm_source=generator" 
                          height={152}
                          title="Priscilla Castro Featured Track"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <a href="https://open.spotify.com/artist/32DezRNmsBb4PU2kZiIzia" target="_blank" rel="noopener noreferrer" className="bg-[#1DB954] text-black px-10 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform flex items-center gap-4 shadow-[0_10px_30px_rgba(29,185,84,0.2)]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.863-1.748-6.466-2.144-10.71-1.173-.408.093-.815-.164-.908-.572-.093-.408.164-.815.572-.908 4.654-1.065 8.636-.61 11.83 1.34.357.218.472.68.253 1.037zm1.467-3.264c-.275.446-.856.59-1.302.316-3.276-2.013-8.27-2.595-12.146-1.418-.503.153-1.037-.133-1.19-.636-.153-.503.133-1.037.636-1.19 4.425-1.343 9.927-.678 13.716 1.648.446.275.59.856.316 1.302zm.127-3.414c-3.928-2.333-10.413-2.55-14.175-1.408-.602.183-1.24-.157-1.423-.759-.183-.602.157-1.24.759-1.423 4.316-1.31 11.47-1.05 16.002 1.64.542.322.72 1.02.398 1.562-.322.542-1.02.72-1.562.398z"/></svg>
                      Seguir en Spotify
                    </a>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* 6. OFFICIAL RELEASE VIDEO SECTION */}
          <div className="relative z-20 bg-noir">
            <CinemaSection />
          </div>
          <ShowList />

          <footer className="relative pt-24 pb-20 md:pt-32 md:pb-24 bg-noir overflow-x-clip">
            <div className="section-fade-top" />
            
            {/* ── CLASSIC GREY GRID ── */}
            <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            <Container className="relative z-10 flex flex-col items-center text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-[210px] md:w-[280px]"
              >
                <Image 
                  src="/logo.png" 
                  alt="Priscilla Castro" 
                  width={360} 
                  height={180} 
                  className="w-full h-auto brightness-0 invert opacity-40 hover:opacity-80 transition-opacity duration-700" 
                />
              </motion.div>

              <div className="flex justify-center gap-6 md:gap-10">
                <SocialIcon url="https://www.facebook.com/pricastromusic" icon={<FacebookIcon />} ariaLabel="Facebook" />
                <SocialIcon url="https://www.instagram.com/priscastromusic/" icon={<InstagramIcon />} ariaLabel="Instagram" />
                <SocialIcon url="https://www.tiktok.com/@priscastromusic" icon={<TikTokIcon />} ariaLabel="TikTok" />
                <SocialIcon url="https://www.youtube.com/@priscastromusic" icon={<YoutubeIcon />} ariaLabel="YouTube" />
                <SocialIcon url="https://open.spotify.com/intl-es/artist/32DezRNmsBb4PU2kZiIzia" icon={<SpotifyIcon />} ariaLabel="Spotify" />
              </div>

              <div className="space-y-4">
                <div className="pt-2 space-y-2 pb-6">
                  <p className="text-ivory/20 text-[9px] tracking-[0.3em] uppercase">
                    © 2024 Priscilla Castro. Todos los derechos reservados.
                  </p>
                  <a 
                    href="https://prosuite.mx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold/40 text-[9px] tracking-[0.5em] font-black uppercase hover:text-gold transition-colors block"
                  >
                    Powered by prosuite.mx
                  </a>
                </div>
              </div>
            </Container>
          </footer>

          <motion.a
            href="https://wa.me/525511349497"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.3)] group"
          >
            <WhatsAppIcon className="w-8 h-8" />
            <span className="absolute right-full mr-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              Contrataciones
            </span>
          </motion.a>
      </SmoothScroll>
    </main>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function SocialIcon({ url, icon, ariaLabel }: { url: string; icon: React.ReactNode; ariaLabel: string }) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      whileHover={{ scale: 1.1, backgroundColor: "rgba(197, 160, 89, 1)", color: "#080808" }}
      className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center text-gold transition-all duration-500"
    >
      <div className="w-6 h-6">
        {icon}
      </div>
    </motion.a>
  );
}

function FacebookIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  );
}

function TikTokIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
  );
}

function InstagramIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  );
}

function YoutubeIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
  );
}

function SpotifyIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.863-1.748-6.466-2.144-10.71-1.173-.408.093-.815-.164-.908-.572-.093-.408.164-.815.572-.908 4.654-1.065 8.636-.61 11.83 1.34.357.218.472.68.253 1.037zm1.467-3.264c-.275.446-.856.59-1.302.316-3.276-2.013-8.27-2.595-12.146-1.418-.503.153-1.037-.133-1.19-.636-.153-.503.133-1.037.636-1.19 4.425-1.343 9.927-.678 13.716 1.648.446.275.59.856.316 1.302zm.127-3.414c-3.928-2.333-10.413-2.55-14.175-1.408-.602.183-1.24-.157-1.423-.759-.183-.602.157-1.24.759-1.423 4.316-1.31 11.47-1.05 16.002 1.64.542.322.72 1.02.398 1.562-.322.542-1.02.72-1.562.398z"/></svg>
  );
}
