"use client";

import { useEffect, useRef } from "react";
import { DESKTOP, gsap, MQ, whenIdle } from "@/lib/gsap";

const TEXT =
  "We build our own software and custom software for schools, clinics, retailers, wholesalers and growing businesses. Every system is built around how your business actually runs.";

const TICKS = [
  "Our products, like Scholarvale",
  "Custom builds, for your business",
  "Web + Android apps",
];

/** Each word starts blurred at 15% and sharpens as it crosses the viewport. */
export function Manifesto() {
  const text = useRef<HTMLParagraphElement>(null);

  useEffect(
    () =>
      whenIdle(() => {
        const mm = gsap.matchMedia();
        mm.add(MQ.motion, () => {
          const words = text.current!.querySelectorAll("span");
          // Blur is a costly filter on phones; there the words only fade.
          const blur = matchMedia(DESKTOP).matches;
          gsap.fromTo(
            words,
            { opacity: 0.15, filter: blur ? "blur(8px)" : "none" },
            {
              opacity: 1,
              filter: blur ? "blur(0px)" : "none",
              ease: "none",
              stagger: 0.12,
              scrollTrigger: {
                trigger: text.current,
                start: "top 82%",
                end: "bottom 48%",
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
    <section
      id="manifesto"
      data-section="manifesto"
      className="relative z-[2] bg-white px-5 py-28 desk:px-12 desk:py-48"
    >
      <div className="mx-auto max-w-6xl desk:pl-10">
        <h2 className="eyebrow text-black/60">What we do</h2>
        <p
          ref={text}
          className="mt-8 text-[clamp(1.75rem,4.4vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.04em]"
        >
          {TEXT.split(" ").map((word, i) => (
            <span key={i} className="inline-block will-change-[opacity,filter]">
              {word}&nbsp;
            </span>
          ))}
        </p>
        <ul className="mt-14 flex flex-col gap-4 desk:mt-20 desk:flex-row desk:gap-12">
          {TICKS.map((tick) => (
            <li key={tick} className="flex items-center gap-3 text-base font-medium desk:text-lg">
              <svg viewBox="0 0 24 24" aria-hidden className="size-6 flex-none">
                <circle cx="12" cy="12" r="12" fill="#EC522C" />
                <path
                  d="M7 12.5l3.3 3.3L17 9"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {tick}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
