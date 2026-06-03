// Native scroll — runs in browser compositor thread at up to 120fps.
// Lenis was removed: JS-based smooth scroll always adds 1-2 frames of startup lag
// that users perceive as "sluggish response". Native scroll is instant.
// Anchor navigation uses CSS scroll-behavior: smooth (see globals.css).

import { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
