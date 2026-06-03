"use client";

import { motion } from "framer-motion";
import Container from "@/components/landing/ui/Container";
import JazzyAurora from "@/components/landing/ui/JazzyAurora";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

type Show = {
  id: string;
  title: string;
  kind: string;
  dateIso: string;
  venueName: string | null;
  city: string | null;
  country: string | null;
  ticketUrl: string | null;
  publicNotes: string | null;
};

function formatShowDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("es-MX", { day: "2-digit" });
  const month = d.toLocaleDateString("es-MX", { month: "long" });
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
}

export default function ShowList({ shows = [] }: { shows?: Show[] }) {
  const hasShows = shows.length > 0;

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
          <p className="text-ivory/20 text-[9px] uppercase tracking-[0.5em] mt-4">
            {hasShows ? "Sesiones Exclusivas" : "Anuncio próximamente"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto border-y border-gold/10">
          {hasShows ? (
            shows.map((show, idx) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className={`relative group ${idx < shows.length - 1 ? "border-b border-gold/10" : ""}`}
              >
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.04] transition-colors duration-500 hidden md:block left-1/2 -translate-x-1/2 w-screen" />

                <div className="relative flex flex-col md:flex-row md:items-center py-8 px-2 gap-6 md:gap-12">
                  <div className="flex-shrink-0">
                    <span className="text-gold font-serif text-2xl md:text-3xl tracking-widest uppercase">
                      {formatShowDate(show.dateIso)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-base md:text-xl text-ivory/90 uppercase tracking-[0.25em] font-marcellus group-hover:text-gold transition-colors">
                      {show.venueName ?? show.title}
                    </h4>
                    <p className="text-[9px] md:text-[10px] text-ivory/40 uppercase tracking-widest font-light mt-1">
                      {[show.city, show.country].filter(Boolean).join(", ")}
                      {show.publicNotes ? ` · ${show.publicNotes}` : ""}
                    </p>
                  </div>

                  {show.ticketUrl ? (
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <a
                        href={show.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-noir text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.3)]"
                      >
                        Tickets
                      </a>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="relative flex flex-col items-center py-12 px-2 gap-4 text-center">
                <p className="text-ivory/40 text-sm md:text-base font-light tracking-widest uppercase">
                  Próximas fechas en agenda privada
                </p>
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold/30 text-gold text-[9px] font-black uppercase tracking-widest hover:border-gold hover:bg-gold/10 transition-all duration-300"
                >
                  Solicitar agenda
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
}
