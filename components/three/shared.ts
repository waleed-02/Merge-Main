import * as THREE from "three";
import { ORANGE } from "@/lib/mark";

/**
 * The whole site is built from these materials. Black is matte and only shows
 * form through soft studio reflections; orange is emissive so it always reads
 * as exactly #EC522C and is the only thing bright enough to bloom.
 */
export const matteBlack = new THREE.MeshStandardMaterial({
  color: "#000000",
  roughness: 0.55,
  metalness: 0,
});

export const glowOrange = new THREE.MeshStandardMaterial({
  color: "#000000",
  emissive: ORANGE,
  emissiveIntensity: 1,
  roughness: 1,
  metalness: 0,
  envMapIntensity: 0.15,
});

export const flatWhite = new THREE.MeshBasicMaterial({ color: "#ffffff" });

/** Thin branch lines: black or white at 40%. */
export const lineBlack = new THREE.MeshBasicMaterial({
  color: "#000000",
  transparent: true,
  opacity: 0.4,
});
/**
 * White at 40% as it lands on the black Process section, mixed ahead of time:
 * a truly transparent white would be bright enough to pick up bloom.
 */
export const WHITE_40_ON_BLACK = "#666666";
export const lineWhite = new THREE.MeshBasicMaterial({ color: WHITE_40_ON_BLACK });

export const smooth = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const backOut = (t: number) => {
  const c = 2.2;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic random, so the tangle is the same on every visit. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Box = { x: number; y: number; w: number; h: number; visible: boolean };

/**
 * Where a DOM element sits in world space on the z = 0 plane. The canvas is
 * fixed to the viewport's top-left, so client rects map straight across.
 */
export function rectToWorld(
  el: HTMLElement | null | undefined,
  size: { width: number; height: number },
  viewport: { width: number },
  out: Box,
) {
  if (!el) {
    out.visible = false;
    return out;
  }
  const r = el.getBoundingClientRect();
  const k = viewport.width / size.width;
  out.x = (r.left + r.width / 2 - size.width / 2) * k;
  out.y = -(r.top + r.height / 2 - size.height / 2) * k;
  out.w = r.width * k;
  out.h = r.height * k;
  out.visible =
    r.width > 0 &&
    r.bottom > -80 &&
    r.top < size.height + 80 &&
    r.right > -80 &&
    r.left < size.width + 80;
  return out;
}

export const newBox = (): Box => ({ x: 0, y: 0, w: 0, h: 0, visible: false });
