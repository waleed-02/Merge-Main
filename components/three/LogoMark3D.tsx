"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MARK, markToWorld, sampleStrand } from "@/lib/mark";
import { createTubeGeometry, updateTube } from "./tube";
import { glowOrange } from "./shared";

/** Control points per strand. The hero tangle resolves onto the same points. */
export const MARK_POINTS = 28;

export type LogoMark3DHandle = {
  /** Scale of the left and right ring nodes, 0–1 (may overshoot while popping). */
  setNodes: (left: number, right: number) => void;
};

type Props = {
  /** Width of the mark in world units. It is centred on its own origin. */
  width: number;
  segments?: number;
  ref?: React.Ref<LogoMark3DHandle>;
};

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const v = new THREE.Vector3();
const s = new THREE.Vector3();

/** The logo mark in 3D: two tubes that Y-merge into one, and two ring nodes. */
export function LogoMark3D({ width, segments = 64, ref }: Props) {
  const caps = useRef<THREE.InstancedMesh>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const k = width / MARK.width;
  const radius = (MARK.stroke / 2) * k;

  const strands = useMemo(
    () =>
      (["top", "bottom"] as const).map((which, i) => {
        const points = sampleStrand(which, MARK_POINTS).map(([x, y]) => {
          const [wx, wy] = markToWorld(x, y, width);
          return new THREE.Vector3(wx, wy, 0);
        });
        const geometry = createTubeGeometry(segments, 12);
        // The second strand is a hair thinner so the shared trunk never z-fights.
        updateTube(geometry, new THREE.CatmullRomCurve3(points), radius * (1 - i * 0.015));
        return { geometry, points };
      }),
    [width, segments, radius],
  );
  useEffect(() => () => strands.forEach((st) => st.geometry.dispose()), [strands]);

  const torus = useMemo(() => {
    const ring = (MARK.nodeRadius + MARK.holeRadius) / 2;
    const tube = (MARK.nodeRadius - MARK.holeRadius) / 2;
    return new THREE.TorusGeometry(ring, tube, 16, 40);
  }, []);
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 20, 14), []);
  useEffect(() => () => (torus.dispose(), sphere.dispose()), [torus, sphere]);

  const setNodes = (left: number, right: number) => {
    const mesh = nodes.current;
    if (!mesh) return;
    [left, right].forEach((scale, i) => {
      const [x, y] = markToWorld(MARK.nodes[i][0], MARK.nodes[i][1], width);
      const n = Math.max(scale, 0.0001) * k;
      // Deeper than it is wide, so the strands never poke through the ring.
      mesh.setMatrixAt(i, m4.compose(v.set(x, y, 0), q, s.set(n, n, n * 1.7)));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  useImperativeHandle(ref, () => ({ setNodes }));

  useLayoutEffect(() => {
    setNodes(1, 1);
    const mesh = caps.current;
    if (!mesh) return;
    const [top, bottom] = strands;
    const ends = [top.points[0], bottom.points[0], top.points[MARK_POINTS - 1]];
    ends.forEach((p, i) => mesh.setMatrixAt(i, m4.compose(p, q, s.setScalar(radius))));
    mesh.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strands, radius]);

  return (
    <group>
      {strands.map((st, i) => (
        <mesh key={i} geometry={st.geometry} material={glowOrange} castShadow frustumCulled={false} />
      ))}
      <instancedMesh ref={caps} args={[sphere, glowOrange, 3]} castShadow frustumCulled={false} />
      <instancedMesh ref={nodes} args={[torus, glowOrange, 2]} castShadow frustumCulled={false} />
    </group>
  );
}
