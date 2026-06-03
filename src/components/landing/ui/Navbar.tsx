"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Container from "./Container";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Inicio", href: "#inicio" },
  { name: "Booking", href: "#contrataciones" },
  { name: "Biografía", href: "#bio" },
  { name: "Trayectoria", href: "#trayectoria" },
  { name: "Música", href: "#musica" },
  { name: "Video", href: "#video" },
  { name: "Fechas", href: "#fechas" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${
          isScrolled 
            ? "py-4 bg-noir/40 backdrop-blur-md border-b border-white/5" 
            : "py-8 bg-transparent"
        }`}
      >
        <Container>
          <div className="relative flex items-center justify-between px-2">
            
            {/* Logo - Minimal & Transparent */}
            <a href="#inicio" onClick={(e) => scrollToSection(e, "#inicio")} className="relative z-10 flex items-center group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gold/30 flex items-center justify-center overflow-hidden group-hover:border-gold transition-all duration-500">
                <Image
                  src="/monogram.png"
                  alt="PC Monogram"
                  width={48}
                  height={48}
                  className="w-8 h-8 md:w-9 md:h-9 object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[5deg] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                />
              </div>
            </a>

            {/* Desktop Navigation - Pure Minimalist */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-[9px] uppercase tracking-[0.4em] text-ivory/40 hover:text-gold transition-colors font-black"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6">
              <a 
                href="https://wa.me/525511349497" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gold text-noir px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Cotizar
              </a>
              
              {/* Mobile Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-ivory/60 hover:text-gold transition-colors"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </Container>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center lg:hidden"
          >
            <div className="flex flex-col items-center gap-10">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="jazzy-title text-4xl text-white hover:text-gold transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              
              <motion.a
                href="https://wa.me/525511349497"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="mt-10 bg-gold text-noir px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                Cotizar
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
