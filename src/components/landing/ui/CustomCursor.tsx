"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 1024 || "ontouchstart" in window
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    // Direct position — no spring physics = no JS frame loop overhead
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const shouldHover = !!target.closest("button, a, .group, [role='button']");
      setIsHovered((prev) => (prev !== shouldHover ? shouldHover : prev));
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleHover, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, [cursorX, cursorY, isMobile]);

  if (isMobile) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        scale: isHovered ? 2.2 : 1,
        opacity: isHovered ? 0.7 : 0.5,
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      // Removed: backdrop-blur (forces full-page recomposit on every mousemove)
      // Removed: mix-blend-difference (expensive GPU blending)
      // Removed: useSpring (runs spring physics simulation at 60fps)
      className="fixed top-0 left-0 w-5 h-5 rounded-full pointer-events-none z-[9999] border border-gold/60 bg-gold/10"
    />
  );
}
