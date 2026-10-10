"use client";

import { useEffect, useRef } from "react";
import { useScrollStore } from "@/lib/scroll-store";
import { LogoMark } from "./LogoMark";

/**
 * The mark draws itself, the nodes pop, then the cover lifts: about 1.1s, all
 * in CSS (see globals.css) so it starts with the first paint and never waits
 * for JavaScript. This component only reports when it has finished.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const { setReady } = useScrollStore.getState();
    const running = el?.getAnimations({ subtree: true }) ?? [];
    if (!el || running.length === 0) {
      setReady();
      return;
    }
    let cancelled = false;
    Promise.allSettled(running.map((a) => a.finished)).then(() => {
      if (cancelled) return;
      el.style.display = "none";
      setReady();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[100] grid place-items-center bg-white"
    >
      <LogoMark className="w-28 text-orange" />
    </div>
  );
}
