"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useScrollStore } from "@/lib/scroll-store";

const ROWS = [
  ["Next.js", "React", "TypeScript", "Tailwind", "Node.js"],
  ["PostgreSQL", "Prisma", "Android", "AWS", "Cloudflare"],
];
const COPIES = 4;

/**
 * Two rows drifting in opposite directions. They only move while the page is
 * scrolling: their speed is the scroll velocity, eased out when you stop.
 */
export function StackMarquee() {
  const section = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useScrollStore((s) => s.reduced);

  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    let speed = 0;
    let active = false;
    const offset = [0, 0];

    const tick = () => {
      const y = window.scrollY;
      speed += ((y - lastY) * 0.55 - speed) * 0.18;
      lastY = y;
      if (!active || Math.abs(speed) < 0.01) return;
      rows.current.forEach((row, i) => {
        if (!row) return;
        const loop = row.scrollWidth / COPIES;
        offset[i] = (((offset[i] + speed * (i === 0 ? -1 : 1)) % loop) - loop) % loop;
        row.style.transform = `translate3d(${offset[i]}px,0,0)`;
      });
    };
    const io = new IntersectionObserver(([entry]) => (active = entry.isIntersecting));
    if (section.current) io.observe(section.current);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [reduced]);

  return (
    <section
      ref={section}
      data-section="stack"
      data-theme="dark"
      aria-labelledby="stack-title"
      className="relative z-[2] overflow-hidden border-t border-white/10 bg-black py-14 text-white desk:py-20"
    >
      <h2 id="stack-title" className="sr-only">
        The stack we build with
      </h2>
      <ul className="sr-only">
        {ROWS.flat().map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div aria-hidden className="flex flex-col gap-3 desk:gap-5">
        {ROWS.map((row, r) => (
          <div
            key={r}
            ref={(el) => {
              rows.current[r] = el;
            }}
            className="display flex w-max items-center whitespace-nowrap text-[clamp(2.25rem,7vw,6.5rem)] will-change-transform"
          >
            {Array.from({ length: COPIES }, () => row)
              .flat()
              .map((item, i) => (
                <span key={i} className="flex items-center">
                  {item}
                  <span className="mx-[0.45em] size-[0.14em] rounded-full bg-orange" />
                </span>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
