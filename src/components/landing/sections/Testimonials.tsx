"use client";

import { motion } from "framer-motion";
import Container from "@/components/landing/ui/Container";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

type Testimonial = {
  id: string;
  clientName: string;
  eventTitle: string | null;
  rating: number;
  quote: string;
  avatarUrl: string | null;
};

function Stars({ rating }: { rating: number }) {
  const clamped = Math.max(1, Math.min(5, rating));
  return (
    <span className="text-gold tracking-[0.3em] text-xs md:text-sm" aria-label={`${clamped} de 5 estrellas`}>
      {"★".repeat(clamped)}
      <span className="text-gold/20">{"★".repeat(5 - clamped)}</span>
    </span>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimoniales"
      className="py-24 md:py-32 bg-noir relative border-t border-gold/10 overflow-x-clip"
    >
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      <JazzyDecorations />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(197,160,89,0.06)_0%,rgba(8,8,8,0)_70%)]" />

      <Container className="relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <span className="deco-title text-[10px] md:text-sm tracking-[0.8em] md:tracking-[2em] text-gold/60 mb-6 inline-block uppercase">
            Voces
          </span>
          <h3 className="font-marcellus text-4xl md:text-6xl text-ivory uppercase tracking-[0.3em]">
            Lo que dicen <br />
            <span className="text-gold italic normal-case tracking-normal">quienes nos vivieron</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, idx) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="relative border border-gold/15 rounded-2xl p-7 md:p-8 bg-noir/40 backdrop-blur-sm hover:border-gold/40 transition-colors duration-500"
            >
              <Stars rating={t.rating} />
              <blockquote className="mt-5 mb-6 text-ivory/80 text-sm md:text-base font-light leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-auto">
                {t.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.avatarUrl}
                    alt={t.clientName}
                    className="w-10 h-10 rounded-full object-cover border border-gold/30"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-sm font-marcellus">
                    {t.clientName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div>
                  <div className="text-ivory/90 text-sm font-marcellus tracking-widest uppercase">
                    {t.clientName}
                  </div>
                  {t.eventTitle ? (
                    <div className="text-ivory/40 text-[10px] uppercase tracking-[0.25em] mt-0.5">
                      {t.eventTitle}
                    </div>
                  ) : null}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
