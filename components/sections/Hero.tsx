"use client";

import { useEffect, useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { anchorRef, scrollState, scrollToTarget, useScrollStore } from "@/lib/scroll-store";

const markSlot = anchorRef("heroMark");
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/**
 * "The Tangle". 350vh of scroll over a pinned stage:
 * A (0–30%) the knot and the question, B (30–65%) it untangles and merges,
 * C (65–100%) the merged line becomes the logo and the pitch lands.
 * The 3D half lives in components/three/HeroScene.tsx and reads the same progress.
 * The intro (lines fading up, the scribble drawing) is CSS, in globals.css.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stageC = useRef<HTMLDivElement>(null);

  // Scroll choreography, scrubbed.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const q = gsap.utils.selector(section);
      const c = stageC.current;
      c?.classList.add("pointer-events-none");

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              scrollState.hero = self.progress;
              stageC.current?.classList.toggle("pointer-events-none", self.progress < 0.84);
              scrollState.invalidate();
            },
          },
        })
        .to(q(".hero-a"), { autoAlpha: 0, y: -48, duration: 0.1 }, 0.16)
        .fromTo(
          q(".hero-word"),
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.2, stagger: 0.04, ease: "power2.out" },
          0.36,
        )
        .to(q(".hero-word"), { opacity: 0, duration: 0.05 }, 0.635)
        .fromTo(q(".hero-wordmark"), { opacity: 0, xPercent: -5 }, { opacity: 1, xPercent: 0, duration: 0.07 }, 0.82)
        .fromTo(
          q(".hero-c"),
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.07, stagger: 0.02, ease: "power2.out" },
          0.86,
        )
        .set({}, {}, 1);
      return () => c?.classList.remove("pointer-events-none");
    });
    return () => mm.revert();
  }, []);

  // A little drag-to-rotate. It springs back when released.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let start: { x: number; y: number } | null = null;
    const move = (e: PointerEvent) => {
      if (!start) return;
      scrollState.drag.x = clamp((e.clientX - start.x) * 0.004, 0.45);
      if (e.pointerType !== "touch") {
        scrollState.drag.y = clamp((e.clientY - start.y) * 0.002, 0.2);
      }
      scrollState.invalidate();
    };
    const up = () => {
      start = null;
      el.classList.remove("select-none");
      window.removeEventListener("pointermove", move);
      gsap.to(scrollState.drag, {
        x: 0,
        y: 0,
        duration: 0.8,
        onUpdate: () => scrollState.invalidate(),
      });
    };
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;
      if (useScrollStore.getState().reduced) return;
      start = { x: e.clientX, y: e.clientY };
      gsap.killTweensOf(scrollState.drag);
      el.classList.add("select-none");
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerup", up, { once: true });
      window.addEventListener("pointercancel", up, { once: true });
    };
    el.addEventListener("pointerdown", down);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  // Keyboard users tab straight to the buttons: bring stage C on screen for them.
  const revealStageC = () => {
    const el = section.current;
    if (!el || useScrollStore.getState().reduced || scrollState.hero > 0.9) return;
    scrollToTarget(el.offsetTop + el.offsetHeight - window.innerHeight);
  };

  return (
    <section
      ref={section}
      id="top"
      data-section="hero"
      className="relative motion-safe:h-[350svh]"
    >
      {/* Behind the 3D scene */}
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 z-0 hidden h-svh flex-col items-center justify-between overflow-hidden py-[9svh] motion-safe:flex"
      >
        <span className="hero-word display text-[21vw] opacity-0 desk:text-[15vw]">We merge</span>
        <span className="hero-word display text-[21vw] opacity-0 desk:text-[15vw]">it all.</span>
      </div>

      {/* In front of it */}
      <div
        ref={stage}
        data-cursor="ring"
        className="relative z-[2] touch-pan-y motion-safe:sticky motion-safe:top-0 motion-safe:-mt-[100svh] motion-safe:h-svh"
      >
        {/* Stage A */}
        <div className="hero-a relative flex min-h-svh flex-col justify-start px-5 pt-24 [@media(max-height:500px)]:pt-10 motion-safe:absolute motion-safe:inset-0 desk:justify-center desk:px-12 desk:pt-0">
          <p className="display text-[clamp(1.5rem,min(8.4vw,9.5svh),3rem)] desk:text-[clamp(3rem,4.7vw,5rem)]">
            <span className="hero-line block">Paper registers.</span>
            <span className="hero-line block" style={{ "--i": 1 } as React.CSSProperties}>Excel sheets.</span>
            <span className="hero-line block" style={{ "--i": 2 } as React.CSSProperties}>Ten WhatsApp groups.</span>
            <span className="hero-line block" style={{ "--i": 3 } as React.CSSProperties}>
              And still no{" "}
              <span className="relative inline-block">
                system?
                <svg
                  aria-hidden
                  viewBox="0 0 300 26"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[0.14em] left-0 h-[0.26em] w-full overflow-visible text-orange"
                  fill="none"
                >
                  <path
                    className="hero-scribble"
                    d="M5 13C48 5 96 20 150 11s98-9 144 1c-58 3-128 4-206 11"
                    pathLength={1}
                    strokeDasharray={1}
                    stroke="currentColor"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
            </span>
          </p>
          <p className="hero-after mt-6 max-w-[22rem] text-base [@media(max-height:500px)]:mt-3 [@media(max-height:500px)]:text-sm font-medium text-black/60 desk:mt-8 desk:text-lg">
            If your school or business runs like this, keep scrolling.
          </p>
          <div className="hero-after absolute bottom-24 left-5 flex h-10 items-center gap-2.5 rounded-full bg-white px-4 font-mono text-[11px] uppercase tracking-[0.08em] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] desk:bottom-10 desk:left-auto desk:right-12 motion-reduce:hidden [@media(max-height:500px)]:hidden">
            <span className="size-1.5 animate-bob rounded-full bg-orange" />
            Scroll
          </div>
        </div>

        {/* Stage C */}
        <div
          ref={stageC}
          onFocus={revealStageC}
          className="flex min-h-svh flex-col px-5 pb-24 pt-14 [@media(max-height:500px)]:pb-20 [@media(max-height:500px)]:pt-3 motion-safe:absolute motion-safe:inset-0 desk:px-12 desk:pb-28 desk:pt-10"
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-5 [@media(max-height:500px)]:flex-row [@media(max-height:500px)]:pb-2 desk:flex-row desk:gap-[2.2vw] desk:pb-0">
            <div ref={markSlot} className="aspect-[120/64] w-[min(38vw,19svh)] flex-none desk:w-[clamp(7rem,15vw,15rem)]" />
            <div
              aria-hidden
              className="hero-wordmark whitespace-nowrap text-[min(13.5vw,7.5svh)] font-extrabold leading-none tracking-[-0.045em] desk:text-[clamp(2.75rem,7.6vw,8rem)]"
            >
              Merge <span className="text-orange">&amp;</span> Main
            </div>
          </div>
          <div className="grid gap-5 [@media(max-height:500px)]:gap-2 desk:grid-cols-[1.25fr_1fr] desk:items-end desk:gap-16">
            <h1 className="hero-c display text-[clamp(1.5rem,min(8vw,4.6svh),2.5rem)] desk:text-[clamp(2.25rem,3.7vw,3.75rem)]">
              Ideas branch off.
              <br />
              We merge them to <span className="text-orange">main.</span>
            </h1>
            <div className="desk:max-w-md desk:justify-self-end">
              <p className="hero-c text-sm font-medium leading-snug text-black/60 [@media(max-height:620px)]:text-[13px] desk:text-base desk:leading-relaxed">
                Merge &amp; Main is a product studio from India. We build our own
                software, like Scholarvale for K-12 schools, and custom ERPs, CRMs,
                dashboards, web and Android apps built around how you work.
              </p>
              <div className="hero-c mt-5 flex flex-wrap gap-2 [@media(max-height:500px)]:mt-2 min-[400px]:gap-3 desk:mt-7">
                <a href="#contact" className="btn btn-primary max-[399px]:px-4 max-[399px]:text-sm">
                  Start a project
                </a>
                <a href="#scholarvale" className="btn btn-outline max-[399px]:px-4 max-[399px]:text-sm">
                  See Scholarvale
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
