import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("brand", ".2,.7,.2,1");
  gsap.defaults({ ease: "brand", duration: 0.6 });
}

/*
 * Breakpoints. The same queries are the `pin:` and `side:` variants in
 * app/globals.css; keep the two in step.
 */

/**
 * A viewport big enough for the desktop treatment: the pinned horizontal
 * track, shadows, bloom. Height matters as much as width, because a landscape
 * phone is over 900px wide but only about 400px tall.
 */
export const DESKTOP = "(min-width: 900px) and (min-height: 480px)";

/** Proportioned widely enough to put the hero's knot beside the headline. */
export const SIDE_BY_SIDE = "(min-aspect-ratio: 23/20)";

/** Media conditions shared by every section's choreography. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  desktop: `${DESKTOP} and (prefers-reduced-motion: no-preference)`,
};

export { gsap, ScrollTrigger };

/**
 * Runs `setup` when the browser is next idle, and returns a cleanup that also
 * cancels it if it has not run yet. Everything below the hero sets up its
 * ScrollTriggers this way, so page load is many short tasks instead of one long one.
 */
export function whenIdle(setup: () => void | (() => void)) {
  let cleanup: void | (() => void);
  let done = false;
  const run = () => {
    done = true;
    cleanup = setup();
  };
  const hasIdle = typeof requestIdleCallback === "function";
  const id = hasIdle ? requestIdleCallback(run, { timeout: 600 }) : window.setTimeout(run, 60);
  return () => {
    if (!done) {
      if (hasIdle) cancelIdleCallback(id);
      else clearTimeout(id);
    }
    if (cleanup) cleanup();
  };
}