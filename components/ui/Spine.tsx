"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, whenIdle } from "@/lib/gsap";

const STOPS = ["manifesto", "scholarvale", "work", "services", "process", "contact"];

/**
 * The orange thread down the left edge. It is the page's scroll progress from
 * the manifesto onward, with a ring node that fills in at each section.
 */
export function Spine() {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(
    () =>
      whenIdle(() => {
        const first = document.getElementById(STOPS[0]);
        const lastEl = document.getElementById(STOPS[STOPS.length - 1]);
        if (!first || !lastEl || !root.current) return;

        const ctx = gsap.context(() => {
          const stops = STOPS.map((id, i) =>
            ScrollTrigger.create({
              trigger: `#${id}`,
              start: i === STOPS.length - 1 ? "top 40%" : "top 60%",
              end: "max",
              onToggle: (self) => {
                nodes.current[i]?.classList.toggle("bg-orange", self.isActive);
                nodes.current[i]?.classList.toggle("bg-white", !self.isActive);
              },
            }),
          );
          const main = ScrollTrigger.create({
            trigger: first,
            start: "top 60%",
            endTrigger: lastEl,
            end: "top 40%",
            onUpdate: (self) => {
              if (line.current) line.current.style.transform = `scaleY(${self.progress})`;
            },
            onToggle: (self) => {
              const shown = self.isActive || self.progress === 1;
              root.current?.classList.toggle("opacity-0", !shown);
            },
            // Place each node where its section falls along the thread.
            onRefresh: (self) => {
              const span = self.end - self.start || 1;
              stops.forEach((st, i) => {
                const node = nodes.current[i];
                if (node)
                  node.style.top = `${Math.min(1, Math.max(0, (st.start - self.start) / span)) * 100}%`;
              });
            },
          });
          main.refresh();
        });
        return () => ctx.revert();
      }),
    [],
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed bottom-[14svh] left-[3px] top-[14svh] z-40 w-2 opacity-0 transition-opacity duration-500 ease-brand desk:left-[18px] desk:w-3"
    >
      <div
        ref={line}
        style={{ transform: "scaleY(0)" }}
        className="absolute inset-y-0 left-[3px] w-0.5 origin-top bg-orange desk:left-[5px]"
      />
      {STOPS.map((id, i) => (
        <span
          key={id}
          ref={(el) => {
            nodes.current[i] = el;
          }}
          className="absolute left-0 size-2 -translate-y-1/2 rounded-full bg-white shadow-[inset_0_0_0_2px_#ec522c] transition-colors duration-300 ease-brand desk:size-3"
        />
      ))}
    </div>
  );
}
