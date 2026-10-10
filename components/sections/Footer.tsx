"use client";

import { useEffect, useRef } from "react";
import { gsap, MQ, whenIdle } from "@/lib/gsap";
import { NAV, site } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLParagraphElement>(null);

  useEffect(
    () =>
      whenIdle(() => {
        const mm = gsap.matchMedia();
        mm.add(MQ.motion, () => {
          gsap.fromTo(
            word.current,
            { yPercent: 100 },
            {
              yPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top 85%",
                end: "bottom bottom",
                scrub: true,
              },
            },
          );
        });
        return () => mm.revert();
      }),
    [],
  );

  return (
    <footer
      ref={root}
      data-section="footer"
      data-theme="dark"
      className="relative z-[2] overflow-hidden bg-black px-5 pb-28 pt-20 text-white desk:px-12 desk:pt-28"
    >
      <div className="flex flex-col gap-10 desk:flex-row desk:items-start desk:justify-between">
        <div>
          <Logo variant="white" className="text-xl" />
          <p className="mt-5 max-w-xs text-lg font-medium leading-snug text-white/70">
            {site.tagline}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-12 gap-y-1 font-mono text-xs uppercase tracking-[0.08em]">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="flex min-h-11 items-center text-white/70 transition-colors duration-300 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.email}`}
                className="flex min-h-11 items-center text-white/70 transition-colors duration-300 hover:text-white"
              >
                Email
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-16 overflow-hidden desk:mt-24">
        <p
          ref={word}
          aria-hidden
          className="whitespace-nowrap text-center pb-[0.12em] text-[15.2vw] font-extrabold leading-none tracking-[-0.05em]"
        >
          Merge <span className="text-orange">&amp;</span> Main
        </p>
      </div>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.08em] text-white/70">
        © 2026 Merge &amp; Main · Product studio, India
      </p>
    </footer>
  );
}
