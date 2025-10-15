// hooks/useInView.ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(rootMargin = "100px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setInView(true)),
      { root: null, rootMargin, threshold: 0 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
