"use client";

import { useEffect, useRef } from "react";
import { gsap, MQ, whenIdle } from "@/lib/gsap";
import { anchorRef } from "@/lib/scroll-store";

export const STEPS = [
  { name: "Understand", text: "We sit with your team and map how work moves today." },
  { name: "Design", text: "Screens and flows you click through and approve before code." },
  { name: "Release in rounds", text: "Small working releases you can use and give feedback on." },
  { name: "Launch", text: "We move your data, train your staff and go live." },
  { name: "Support", text: "Fixes, updates and new features as you grow." },
];
const stepSlots = STEPS.map((_, i) => anchorRef(`step${i}`));

/**
 * The git graph. The 3D graph (components/three/ProcessScene.tsx) hangs its
 * commits on the markers below, so scrolling the list is the camera travelling
 * down the main line. The section itself must not create a stacking context:
 * its background sits under the canvas and its content above it.
 */
export function Process() {
  const section = useRef<HTMLElement>(null);

  useEffect(
    () =>
      whenIdle(() => {
        const mm = gsap.matchMedia();
        mm.add(MQ.motion, () => {
          gsap.utils.toArray<HTMLElement>(".step-card", section.current).forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0.12, y: 36 },
              {
                opacity: 1,
                y: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: card.parentElement,
                  start: "top 78%",
                  end: "top 50%",
                  scrub: true,
                },
              },
            );
          });
        });
        return () => mm.revert();
      }),
    [],
  );

  return (
    <section
      ref={section}
      id="process"
      data-section="process"
      data-theme="dark"
      className="relative text-white"
    >
      <div aria-hidden className="absolute inset-0 z-0 bg-black" />
      <div className="relative z-[2] px-5 py-24 desk:px-12 desk:py-40">
        <p className="eyebrow text-white/70">Process</p>
        <h2 className="display mt-6 max-w-[12ch] text-[clamp(2.5rem,7vw,7rem)]">
          From first call to <span className="text-orange">main.</span>
        </h2>
        <p className="mt-8 max-w-xl text-base font-medium leading-snug text-white/70 desk:text-xl">
          You see working software early and often. Each round merges into your product only after
          you have tried it and signed off.
        </p>

        <ol className="mt-20 desk:mt-32">
          {STEPS.map((step, i) => (
            <li key={step.name} className="relative min-h-[58svh] last:min-h-[30svh]">
              {/* A ring-node commit hangs here */}
              <span
                ref={stepSlots[i]}
                aria-hidden
                className="absolute left-3 top-9 size-7 desk:left-[27%] desk:top-12 desk:size-9"
              />
              <div className="step-card ml-16 max-w-xl desk:ml-[38%]">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/70">
                  0{i + 1}
                </p>
                <h3 className="display mt-3 text-[clamp(2rem,4.6vw,4.25rem)]">{step.name}</h3>
                <p className="mt-4 text-base font-medium leading-snug text-white/70 desk:text-xl">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
