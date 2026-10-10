"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { MARK, ORANGE, markToWorld, sampleStrand } from "@/lib/mark";
import { scrollState, useScrollStore } from "@/lib/scroll-store";
import { LogoMark3D, MARK_POINTS, type LogoMark3DHandle } from "./LogoMark3D";
import { createTubeGeometry, updateTube } from "./tube";
import { backOut, lerp, matteBlack, newBox, rectToWorld, seeded, smooth } from "./shared";

const K = MARK_POINTS;
const LABELS = [
  "Paper registers",
  "Excel v7_final",
  "WhatsApp group 4",
  "Fee diary",
  "Attendance sheet",
];
/** Which control point each label rides on. */
const LABEL_AT = [7, 20, 9, 19, 21];
const PARALLAX = (4 * Math.PI) / 180;
const ORANGE_C = new THREE.Color(ORANGE);

/** The tubes share one material: matte black that warms to the brand orange as they merge. */
const material = matteBlack.clone();
material.emissive = new THREE.Color("#000000");
function tintTangle(orange: number, merged: number) {
  material.emissive.setRGB(0, 0, 0).lerp(ORANGE_C, orange);
  material.envMapIntensity = lerp(0.8, 0.15, merged);
  material.roughness = lerp(0.55, 1, merged);
}

/**
 * Every tube is K control points, and has four poses:
 * tangled → relaxed → pulled into two strands → the Y of the logo mark.
 */
function buildShapes(n: number, vw: number, vh: number, markW: number, stacked: boolean) {
  const rand = seeded(11);
  const L = vw / 2 + 1.6;
  const knot = Math.max(0.5, Math.min(1, vw / 7.5));
  // Tall screens stack the knot under the headline; wide ones put it beside.
  const cx = stacked ? 0 : vw * 0.22;
  const cy = stacked ? -vh * 0.17 : 0;
  const k = markW / MARK.width;
  const strands = {
    top: sampleStrand("top", K).map(([x, y]) => markToWorld(x, y, markW)),
    bottom: sampleStrand("bottom", K).map(([x, y]) => markToWorld(x, y, markW)),
  };

  const bump = new Float32Array(K);
  for (let j = 0; j < K; j++) {
    const s = (2 * j) / (K - 1) - 1;
    bump[j] = Math.pow(1 - s * s, 3);
  }

  const tubes = Array.from({ length: n }, (_, i) => {
    const top = i % 2 === 0;
    const T = new Float32Array(K * 3);
    const R = new Float32Array(K * 3);
    const M0 = new Float32Array(K * 3);
    const M1 = new Float32Array(K * 3);
    const turns = 1.1 + rand() * 0.8;
    const radius = (0.9 + rand() * 0.8) * knot;
    const figure = rand() > 0.5 ? 1.5 : 1;
    const p1 = rand() * 6.28;
    const p2 = rand() * 6.28;
    const p3 = rand() * 6.28;
    // Side by side, the headline sits on the left, so tubes drop in from above or below it.
    const yLeft = stacked
      ? cy + (rand() - 0.5) * vh * 0.4
      : (top ? 1 : -1) * vh * (0.8 + rand() * 0.35);
    const yRight = stacked ? cy + (rand() - 0.5) * vh * 0.4 : (rand() - 0.5) * vh * 0.8;
    const lane = (i - (n - 1) / 2) * 0.44 * knot;
    const mark = top ? strands.top : strands.bottom;

    for (let j = 0; j < K; j++) {
      const u = j / (K - 1);
      const s = 2 * u - 1;
      const w = bump[j];
      const a = s * Math.PI * turns + p1;
      // Points bunch up in the middle, so the knot gets most of the tube's detail.
      T[j * 3] = L * Math.sign(s) * Math.pow(Math.abs(s), 2.2) + cx * w + w * radius * Math.cos(a);
      T[j * 3 + 1] = lerp(lerp(yLeft, yRight, u), cy, w) + w * radius * 0.85 * Math.sin(a * figure + p2);
      T[j * 3 + 2] = w * 1.05 * knot * Math.sin(a * 0.5 + p3);

      R[j * 3] = lerp(-L, L, u);
      R[j * 3 + 1] = lane + 0.1 * knot * Math.sin(u * 7 + p1);
      R[j * 3 + 2] = 0;

      M0[j * 3] = lerp(-L, L, u);
      M0[j * 3 + 1] = (top ? 16 : -16) * k;
      M0[j * 3 + 2] = 0;

      M1[j * 3] = mark[j][0];
      M1[j * 3 + 1] = mark[j][1];
      M1[j * 3 + 2] = 0;
    }
    return { T, R, M0, M1, phase: p1, rank: Math.floor(i / 2) };
  });
  return { tubes, bump };
}

export function HeroScene() {
  const mobile = useScrollStore((s) => s.mobile);
  const stacked = useScrollStore((s) => s.stacked);
  const reduced = useScrollStore((s) => s.reduced);
  const ready = useScrollStore((s) => s.ready);
  const { viewport, size } = useThree();

  // `mobile` decides how much to draw; `stacked` decides where it goes.
  const n = mobile ? 4 : 7;
  const segments = mobile ? 44 : 64;
  const radial = mobile ? 8 : 12;
  const vw = viewport.width;
  const vh = viewport.height;
  // The merged mark fills most of a tall screen's width, and never outgrows a short one.
  const markW = Math.min(vw * (stacked ? 0.74 : 0.6), vh * 1.25, 8);
  const thin = mobile ? 0.05 : 0.075;
  const thick = (MARK.stroke / 2) * (markW / MARK.width);

  const shapes = useMemo(
    () => buildShapes(n, vw, vh, markW, stacked),
    [n, vw, vh, markW, stacked],
  );
  const geometries = useMemo(
    () => Array.from({ length: n }, () => createTubeGeometry(segments, radial)),
    [n, segments, radial],
  );
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  const curves = useMemo(
    () =>
      Array.from(
        { length: n },
        () => new THREE.CatmullRomCurve3(Array.from({ length: K }, () => new THREE.Vector3())),
      ),
    [n],
  );
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 16, 10), []);
  useEffect(() => () => sphere.dispose(), [sphere]);

  const root = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const tangle = useRef<THREE.Group>(null);
  const markGroup = useRef<THREE.Group>(null);
  const mark = useRef<LogoMark3DHandle>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const labelGroups = useRef<(THREE.Group | null)[]>([]);
  const labelEls = useRef<(HTMLDivElement | null)[]>([]);
  const last = useRef(-1);
  const labelShown = useRef(-1);
  const frame = useRef(0);
  const scratch = useMemo(
    () => ({ box: newBox(), m4: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3() }),
    [],
  );

  // New shapes or geometry: force a rebuild on the next frame.
  useEffect(() => {
    last.current = -1;
    scrollState.invalidate();
  }, [shapes, geometries, ready, reduced]);

  useFrame((state, delta) => {
    const visible = !!useScrollStore.getState().inView.hero;
    const p = reduced ? 1 : scrollState.hero;

    // The labels are DOM, so they are hidden by hand whenever the tangle is.
    const labelOpacity =
      visible && ready && !reduced ? Math.round((1 - smooth(0.16, 0.28, p)) * 50) / 50 : 0;
    if (labelOpacity !== labelShown.current) {
      labelShown.current = labelOpacity;
      labelEls.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = String(labelOpacity);
        el.style.visibility = labelOpacity > 0.01 ? "visible" : "hidden";
      });
    }

    if (root.current) root.current.visible = visible;
    if (!visible || !rig.current || !tangle.current || !markGroup.current) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Parallax (±4°) plus whatever the visitor has dragged.
    const targetY = reduced ? 0 : scrollState.pointer.x * PARALLAX + scrollState.drag.x;
    const targetX = reduced ? 0 : scrollState.pointer.y * PARALLAX * 0.6 + scrollState.drag.y;
    const r = rig.current.rotation;
    r.y = THREE.MathUtils.damp(r.y, targetY, 6, dt);
    r.x = THREE.MathUtils.damp(r.x, targetX, 6, dt);
    const settling = Math.abs(r.y - targetY) + Math.abs(r.x - targetX) > 0.0015;

    // Stage C: pull back until the mark sits in its slot beside the wordmark.
    // The slot is only measured once it matters, to keep layout reads out of stage A.
    const d = smooth(0.66, 0.86, p);
    const box = scratch.box;
    if (d > 0) rectToWorld(scrollState.anchors.heroMark, size, viewport, box);
    const slotScale = box.w > 0 ? box.w / markW : 0.4;
    rig.current.position.set(lerp(0, box.x, d), lerp(0, box.y, d), 0);
    rig.current.scale.setScalar(lerp(1, slotScale, d));

    const merged = p >= 0.645;
    tangle.current.visible = !merged;
    markGroup.current.visible = merged;

    if (merged) {
      mark.current?.setNodes(backOut(smooth(0.72, 0.8, p)), backOut(smooth(0.78, 0.86, p)));
    }

    // The idle "breathing" runs at half rate on phones.
    const breathing = !reduced && p < 0.3;
    frame.current++;
    const breathe = breathing && (!mobile || frame.current % 2 === 0);
    if (!merged && (breathe || p !== last.current)) {
      const b = smooth(0.44, 0.54, p);
      const c = smooth(0.54, 0.64, p);
      tintTangle(smooth(0.5, 0.62, p), c);

      shapes.tubes.forEach((tube, i) => {
        const a = smooth(0.28 + i * 0.012, 0.44 + i * 0.012, p);
        const pts = curves[i].points;
        for (let j = 0; j < K; j++) {
          const o = j * 3;
          const breathe = shapes.bump[j] * (1 - a);
          let x = tube.T[o] + Math.sin(t * 0.5 + tube.phase * 2.3 + j * 0.3) * 0.04 * breathe;
          let y = tube.T[o + 1] + Math.sin(t * 0.7 + tube.phase + j * 0.5) * 0.07 * breathe;
          let z = tube.T[o + 2] + Math.cos(t * 0.55 + tube.phase * 1.7 + j * 0.4) * 0.09 * breathe;
          x = lerp(lerp(lerp(x, tube.R[o], a), tube.M0[o], b), tube.M1[o], c);
          y = lerp(lerp(lerp(y, tube.R[o + 1], a), tube.M0[o + 1], b), tube.M1[o + 1], c);
          z = lerp(lerp(lerp(z, tube.R[o + 2], a), tube.M0[o + 2], b), tube.M1[o + 2], c);
          pts[j].set(x, y, z);
        }
        // Strands thicken as they bundle; nested radii stop them z-fighting.
        const radius = lerp(lerp(thin, thin * 1.5, b), thick, c) * (1 - 0.015 * tube.rank * c);
        updateTube(geometries[i], curves[i], radius);
        if (caps.current) {
          const { m4, q, s } = scratch;
          caps.current.setMatrixAt(i * 2, m4.compose(pts[0], q, s.setScalar(radius)));
          caps.current.setMatrixAt(i * 2 + 1, m4.compose(pts[K - 1], q, s.setScalar(radius)));
        }
      });
      if (caps.current) caps.current.instanceMatrix.needsUpdate = true;

      LABELS.forEach((_, i) => {
        labelGroups.current[i]?.position.copy(curves[i % n].points[LABEL_AT[i]]);
      });
    }

    last.current = p;
    if (settling || breathing) state.invalidate();
  });

  return (
    <group ref={root}>
      <group ref={rig}>
        <group ref={tangle}>
          {geometries.map((geometry, i) => (
            <mesh key={i} geometry={geometry} material={material} castShadow frustumCulled={false} />
          ))}
          <instancedMesh
            key={n}
            ref={caps}
            args={[sphere, material, n * 2]}
            castShadow
            frustumCulled={false}
          />
          {LABELS.map((label, i) => (
            <group
              key={label}
              ref={(el) => {
                labelGroups.current[i] = el;
              }}
            >
              <Html center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
                <div
                  ref={(el) => {
                    labelEls.current[i] = el;
                  }}
                  aria-hidden
                  style={{ opacity: 0, visibility: "hidden" }}
                  className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-black shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] transition-opacity duration-500 desk:text-[11px]"
                >
                  {label}
                </div>
              </Html>
            </group>
          ))}
        </group>
        {!mobile && (
          // An unseen wall just behind the tubes, so they cast onto the page.
          <mesh position={[0, 0, -1.25]} receiveShadow>
            <planeGeometry args={[60, 30]} />
            <shadowMaterial transparent opacity={0.13} />
          </mesh>
        )}
        <group ref={markGroup} visible={false}>
          <LogoMark3D ref={mark} width={markW} segments={segments} />
        </group>
      </group>
    </group>
  );
}
