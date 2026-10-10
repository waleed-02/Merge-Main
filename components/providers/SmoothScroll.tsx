"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { DESKTOP, gsap, MQ, ScrollTrigger, SIDE_BY_SIDE } from "@/lib/gsap";
import { scrollState, scrollToTarget, useScrollStore, type SectionId } from "@/lib/scroll-store";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Owns everything that feeds the scroll store: Lenis (synced to ScrollTrigger),
 * which section is active / in view, and the pointer or gyro position.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useScrollStore((s) => s.reduced);

  // Environment: reduced motion, viewport size and proportions. These follow
  // the window live, so rotating a phone or resizing a window re-lays the 3D out.
  useEffect(() => {
    const queries = [MQ.reduced, DESKTOP, SIDE_BY_SIDE].map((q) => matchMedia(q));
    const [reducedMq, desktopMq, sideMq] = queries;
    const sync = () =>
      useScrollStore.getState().setEnv({
        reduced: reducedMq.matches,
        mobile: !desktopMq.matches,
        stacked: !sideMq.matches,
      });
    sync();
    queries.forEach((mq) => mq.addEventListener("change", sync));
    return () => queries.forEach((mq) => mq.removeEventListener("change", sync));
  }, []);

  // Pointer and gyro parallax input.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      scrollState.mouse.x = e.clientX;
      scrollState.mouse.y = e.clientY;
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      scrollState.invalidate();
    };
    let base: { beta: number; gamma: number } | null = null;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!useScrollStore.getState().inView.hero) return;
      base ??= { beta: e.beta, gamma: e.gamma };
      const x = clamp((e.gamma - base.gamma) / 20);
      const y = clamp((e.beta - base.beta) / 20);
      const { pointer } = scrollState;
      if (Math.abs(x - pointer.x) + Math.abs(y - pointer.y) < 0.03) return;
      pointer.x = x;
      pointer.y = y;
      scrollState.invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    if (!reduced) window.addEventListener("deviceorientation", onTilt);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [reduced]);

  // In-page links glide instead of jumping.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (!hash || hash.length < 2) return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(hash);
      history.replaceState(null, "", hash);
      // Move keyboard focus along with the scroll.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Smooth scroll, section tracking.
  useEffect(() => {
    const { setActive, setInView } = useScrollStore.getState();
    const sections = gsap.utils.toArray<HTMLElement>("[data-section]");

    const triggers = sections.flatMap((el) => {
      const id = el.dataset.section as SectionId;
      return [
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => setInView(id, self.isActive),
        }),
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(id),
        }),
      ];
    });

    const onScroll = (y: number, velocity: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.direction = y >= scrollState.y ? 1 : -1;
      scrollState.y = y;
      scrollState.velocity = velocity;
      scrollState.progress = max > 0 ? y / max : 0;
      scrollState.invalidate();
    };

    if (reduced) {
      // No smoothing, no pinning: sections fade in once and that is all.
      const onNative = () => onScroll(window.scrollY, 0);
      window.addEventListener("scroll", onNative, { passive: true });
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }),
        { rootMargin: "0px 0px -10% 0px" },
      );
      sections.forEach((el) => {
        el.classList.add("rm-fade");
        io.observe(el);
      });
      return () => {
        window.removeEventListener("scroll", onNative);
        io.disconnect();
        sections.forEach((el) => el.classList.remove("rm-fade", "is-in"));
        triggers.forEach((t) => t.kill());
      };
    }

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    scrollState.lenis = lenis;
    lenis.on("scroll", (l: Lenis) => {
      onScroll(l.scroll, l.velocity);
      ScrollTrigger.update();
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      scrollState.lenis = null;
      triggers.forEach((t) => t.kill());
    };
  }, [reduced]);

  return <>{children}</>;
}
