"use client";

import { motion } from "framer-motion";
import Container from "@/components/landing/ui/Container";

type Item = {
  id: string;
  url: string;
  alt: string;
  linkUrl: string | null;
};

export default function PressStrip({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <section id="prensa" className="py-20 md:py-24 bg-noir relative border-t border-gold/10 overflow-x-clip">
      <div className="section-fade-top" />
      <Container className="relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-ivory/30 text-[9px] md:text-[10px] uppercase tracking-[0.8em] md:tracking-[1em]">
            Han hablado de ella
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-8 max-w-5xl mx-auto">
          {items.map((item, idx) => {
            const logo = (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
                className="relative h-8 md:h-10 flex items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt}
                  loading="lazy"
                  className="max-h-full w-auto object-contain brightness-0 invert opacity-40 hover:opacity-80 transition-opacity duration-500"
                />
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
                {logo}
              </a>
            ) : (
              <div key={item.id}>{logo}</div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
