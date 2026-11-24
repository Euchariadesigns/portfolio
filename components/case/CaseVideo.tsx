"use client";

import { useEffect, useRef } from "react";

// A muted product recording that plays while it is on screen.
export default function CaseVideo({ src, poster, w, h, label }: { src: string; poster?: string; w: number; h: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const p = v.play();
          if (p) p.catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      width={w}
      height={h}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}
