"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { STEPS } from "@/components/sections/Process";
import { ORANGE } from "@/lib/mark";
import { scrollState, useScrollStore } from "@/lib/scroll-store";
import { glowOrange, lineWhite, newBox, rectToWorld, WHITE_40_ON_BLACK } from "./shared";

const N = STEPS.length;
const IDLE = new THREE.Color(WHITE_40_ON_BLACK);
const MAIN = new THREE.Color(ORANGE);
const ringMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
const fillMaterial = new THREE.MeshBasicMaterial({ color: ORANGE });

/**
 * The git graph on the black Process section: an orange main line with five
 * ring-node commits, and thin side branches that split off and merge back.
 * Commits are pinned to the DOM markers beside each step, so the graph scrolls
 * with the page and each node fills as it reaches the middle of the viewport.
 */
export function ProcessScene() {
  const mobile = useScrollStore((s) => s.mobile);
  const reduced = useScrollStore((s) => s.reduced);
  const { size, viewport } = useThree();
  const [gap, setGap] = useState(0);
  const [nodeR, setNodeR] = useState(0.12);

  const root = useRef<THREE.Group>(null);
  const mainLine = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.InstancedMesh>(null);
  const fills = useRef<THREE.InstancedMesh>(null);
  const fill = useRef(new Float32Array(N));
  const scratch = useMemo(
    () => ({
      a: newBox(),
      b: newBox(),
      m4: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      v: new THREE.Vector3(),
      s: new THREE.Vector3(),
      c: new THREE.Color(),
    }),
    [],
  );

  const top = gap * 0.22;
  const bottom = -(N - 1) * gap - gap * 0.3;

  // Side branches: leave the main line after a commit, rejoin before the next.
  const branches = useMemo(() => {
    if (gap <= 0) return { tubes: [] as THREE.TubeGeometry[], dots: [] as THREE.Vector3[] };
    const reach = mobile ? 0.34 : 0.8;
    const spans = [
      { from: 0, to: 1, side: 1, r: 1, z: 0.35 },
      { from: 1, to: 2, side: -1, r: 0.8, z: -0.3 },
      { from: 1, to: 3, side: 1, r: 1.6, z: -0.5 },
      { from: 2, to: 3, side: -1, r: 1.25, z: 0.4 },
      { from: 3, to: 4, side: 1, r: 0.9, z: 0.3 },
    ];
    const dots: THREE.Vector3[] = [];
    const tubes = spans.map(({ from, to, side, r, z }) => {
      const y0 = -from * gap - gap * 0.14;
      const y1 = -to * gap + gap * 0.14;
      const x = (mobile ? 1 : side) * reach * r;
      const at = (t: number) => y0 + (y1 - y0) * t;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, y0, 0),
        new THREE.Vector3(x * 0.85, at(0.22), z),
        new THREE.Vector3(x, at(0.5), z),
        new THREE.Vector3(x * 0.85, at(0.78), z),
        new THREE.Vector3(0, y1, 0),
      ]);
      dots.push(curve.getPoint(0.38), curve.getPoint(0.62));
      return new THREE.TubeGeometry(curve, 48, 0.011, 6);
    });
    return { tubes, dots };
  }, [gap, mobile]);
  useEffect(() => () => branches.tubes.forEach((g) => g.dispose()), [branches]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const { a, b, m4, q, v, s, c } = scratch;
    rectToWorld(scrollState.anchors.step0, size, viewport, a);
    rectToWorld(scrollState.anchors.step1, size, viewport, b);
    if (a.w <= 0) return;

    // The graph is rebuilt only when the layout's spacing actually changes.
    const g = Math.round((a.y - b.y) * 40) / 40;
    if (g !== gap) setGap(g);
    const r = Math.round(a.w * 50) / 100;
    if (r !== nodeR) setNodeR(r);

    root.current.position.set(a.x, a.y, 0);
    root.current.rotation.y = 0.32 + (reduced ? 0 : scrollState.pointer.x * 0.08);

    // "Now" is a little above the middle of the viewport, in graph space.
    const now = viewport.height * 0.06 - a.y;
    const dt = Math.min(delta, 0.05);
    let moving = false;
    for (let i = 0; i < N; i++) {
      const target = reduced || -i * gap >= now ? 1 : 0;
      const f = THREE.MathUtils.damp(fill.current[i], target, 9, dt);
      if (Math.abs(f - target) > 0.004) moving = true;
      fill.current[i] = f;
      v.set(0, -i * gap, 0);
      rings.current?.setMatrixAt(i, m4.compose(v, q, s.setScalar(nodeR * (1 + f * 0.12))));
      rings.current?.setColorAt(i, c.copy(IDLE).lerp(MAIN, f));
      const d = Math.max(nodeR * 0.5 * f, 1e-4);
      fills.current?.setMatrixAt(i, m4.compose(v, q, s.set(d, d, d * 0.4)));
    }
    if (rings.current) {
      rings.current.instanceMatrix.needsUpdate = true;
      if (rings.current.instanceColor) rings.current.instanceColor.needsUpdate = true;
    }
    if (fills.current) fills.current.instanceMatrix.needsUpdate = true;

    // The orange main line has been drawn down to "now".
    if (mainLine.current) {
      const length = reduced ? top - bottom : Math.min(Math.max(top - now, 0), top - bottom);
      mainLine.current.visible = length > 0.001;
      mainLine.current.scale.set(1, Math.max(length, 0.001), 1);
      mainLine.current.position.y = top - length / 2;
    }
    if (moving) state.invalidate();
  });

  return (
    <group ref={root}>
      <mesh material={lineWhite} position={[0, (top + bottom) / 2, 0]} scale={[1, Math.max(top - bottom, 0.001), 1]}>
        <cylinderGeometry args={[0.011, 0.011, 1, 6]} />
      </mesh>
      <mesh ref={mainLine} material={glowOrange} visible={false}>
        <cylinderGeometry args={[nodeR * 0.2, nodeR * 0.2, 1, 12]} />
      </mesh>
      {branches.tubes.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={lineWhite} />
      ))}
      {branches.dots.map((p, i) => (
        <mesh key={i} position={p} material={lineWhite}>
          <sphereGeometry args={[0.04, 12, 8]} />
        </mesh>
      ))}
      <instancedMesh ref={rings} args={[undefined, ringMaterial, N]} frustumCulled={false}>
        <torusGeometry args={[0.72, 0.28, 14, 40]} />
      </instancedMesh>
      <instancedMesh ref={fills} args={[undefined, fillMaterial, N]} frustumCulled={false}>
        <sphereGeometry args={[1, 16, 12]} />
      </instancedMesh>
    </group>
  );
}
