"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const RING = "a, button, summary, [role='radio'], [data-cursor='ring']";
const NATIVE = "input, textarea, select";

/**
 * Desktop cursor: a small black dot (white over black sections) that opens
 * into an orange ring over links and 3D objects.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const x = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x(e.clientX);
      y(e.clientY);
      const target = e.target as Element | null;
      el.dataset.state = target?.closest(NATIVE)
        ? "hidden"
        : target?.closest(RING)
          ? "ring"
          : "dot";
      el.dataset.dark = target?.closest("[data-theme='dark'], .dock") ? "true" : "false";
    };
    const onLeave = () => (el.dataset.state = "hidden");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      data-state="hidden"
      className="group pointer-events-none fixed left-0 top-0 z-[90] hidden [@media(hover:hover)_and_(pointer:fine)]:block"
    >
      <div className="size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[inset_0_0_0_0_#ec522c] transition-[width,height,background-color,box-shadow,opacity] duration-300 ease-brand group-data-[dark=true]:bg-white group-data-[state=hidden]:opacity-0 group-data-[state=ring]:size-11 group-data-[state=ring]:bg-transparent group-data-[state=ring]:shadow-[inset_0_0_0_2px_#ec522c]" />
    </div>
  );
}
