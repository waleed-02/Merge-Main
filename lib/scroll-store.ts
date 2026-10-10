import { create } from "zustand";
import type Lenis from "lenis";

export type SectionId =
  | "hero"
  | "manifesto"
  | "scholarvale"
  | "work"
  | "services"
  | "process"
  | "stack"
  | "contact"
  | "footer";

/** Sections where the canvas has to sit above the page instead of behind it. */
const FRONT_SECTIONS: SectionId[] = ["scholarvale", "work", "services"];

type ScrollStore = {
  /** Preloader finished, hero may play its intro. */
  ready: boolean;
  reduced: boolean;
  /** Anything short of a desktop-sized viewport: lighter 3D, no pinned track. */
  mobile: boolean;
  /** Tall-proportioned screen: the hero's knot sits under the headline, not beside it. */
  stacked: boolean;
  active: SectionId;
  inView: Partial<Record<SectionId, boolean>>;
  canvasFront: boolean;
  setReady: () => void;
  setEnv: (env: { reduced: boolean; mobile: boolean; stacked: boolean }) => void;
  setActive: (id: SectionId) => void;
  setInView: (id: SectionId, value: boolean) => void;
};

/** Discrete state. Anything that changes at most a few times per section. */
export const useScrollStore = create<ScrollStore>((set) => ({
  ready: false,
  reduced: false,
  mobile: false,
  stacked: false,
  active: "hero",
  inView: { hero: true },
  canvasFront: false,
  setReady: () => set({ ready: true }),
  setEnv: (env) => set(env),
  setActive: (active) =>
    set({ active, canvasFront: FRONT_SECTIONS.includes(active) }),
  setInView: (id, value) => {
    set((s) =>
      s.inView[id] === value ? s : { inView: { ...s.inView, [id]: value } },
    );
    scrollState.invalidate();
  },
}));

/**
 * Per-frame values. Written by ScrollTrigger / Lenis / pointer handlers and read
 * inside useFrame, so they live outside React and never cause a re-render.
 */
export const scrollState = {
  y: 0,
  velocity: 0,
  direction: 1 as 1 | -1,
  /** Whole-page progress, 0–1. */
  progress: 0,
  /** Section progress, 0–1. */
  hero: 0,
  process: 0,
  contact: 0,
  /** Pointer (or gyro) position, -1…1 on both axes. */
  pointer: { x: 0, y: 0 },
  /** Pointer in client pixels. */
  mouse: { x: 0, y: 0 },
  /** Hero drag-to-rotate offset in radians. */
  drag: { x: 0, y: 0 },
  /** Hovered services row, -1 when none. */
  service: -1,
  lenis: null as Lenis | null,
  /** DOM elements that 3D objects pin themselves to. */
  anchors: {} as Record<string, HTMLElement | null>,
  /** Asks the demand-driven canvas for one more frame. Set by the scene. */
  invalidate: () => {},
};

/** Callback ref that registers an element as a 3D anchor. */
export const anchorRef = (name: string) => (el: HTMLElement | null) => {
  scrollState.anchors[name] = el;
  scrollState.invalidate();
};

export function scrollToTarget(target: string | number) {
  const { lenis } = scrollState;
  if (lenis) {
    lenis.scrollTo(target, { duration: 0.8 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  document.querySelector(target)?.scrollIntoView();
}
