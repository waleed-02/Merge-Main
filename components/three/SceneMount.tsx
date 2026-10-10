"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useScrollStore } from "@/lib/scroll-store";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * three.js is the heaviest thing on the page, so it loads in its own chunk,
 * only after the preloader has lifted and the browser is idle. The HTML hero is
 * the LCP, not the canvas.
 */
export function SceneMount() {
  const ready = useScrollStore((s) => s.ready);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ready) return;
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setShow(true), { timeout: 1200 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(id);
  }, [ready]);
  return show ? <Scene /> : null;
}
