"use client";

import { motion } from "framer-motion";
import Container from "@/components/landing/ui/Container";
import JazzyDecorations from "@/components/landing/ui/JazzyDecorations";

type Item = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  alt: string;
  caption: string | null;
  linkUrl: string | null;
};

export default function Gallery({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="galeria"
      className="py-24 md:py-32 bg-noir relative border-t border-gold/10 overflow-x-clip"
    >
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      <JazzyDecorations />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_100%_0%,rgba(197,160,89,0.06)_0%,rgba(8,8,8,0)_70%)]" />

      <Container className="relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <span className="deco-title text-[10px] md:text-sm tracking-[0.8em] md:tracking-[2em] text-gold/60 mb-6 inline-block uppercase">
            Atmósfera
          </span>
          <h3 className="font-marcellus text-4xl md:text-6xl text-ivory uppercase tracking-[0.3em]">
            En <span className="text-gold italic normal-case tracking-normal">escena</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
          {items.map((item, idx) => {
            const inner = (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-gold/15 bg-noir/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {item.caption ? (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noir/95 via-noir/60 to-transparent p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-ivory/90 text-[10px] md:text-xs uppercase tracking-widest font-light">
                      {item.caption}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            );

            return item.linkUrl ? (
              <a
                key={item.id}
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.alt}
              >
                {inner}
              </a>
            ) : (
              <div key={item.id}>{inner}</div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
