"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { MARK } from "@/lib/mark";
import { scrollState, useScrollStore } from "@/lib/scroll-store";
import { createTubeGeometry, setTubeDraw, updateTube } from "./tube";
import { lineBlack, newBox, rectToWorld, smooth } from "./shared";

/**
 * Where each branch enters the viewport, as a fraction of its half-size
 * (-1…1). Anything beyond ±1 on x comes in from the side and runs flat;
 * the rest drop in from the top or bottom edge.
 */
const BRANCHES: [number, number][] = [
  [1.1, 0.82],
  [-0.2, 1.15],
  [1.1, -0.42],
  [-1.1, -0.55],
  [0.5, -1.15],
  [-1.1, 0.9],
  [1.1, 0.2],
];

const dir = new THREE.Vector3();

/**
 * Contact: the thin branch lines from around the page run in from the edges,
 * each makes one clean bend, and they all merge into the logo's ring node.
 */
export function ConvergeScene() {
  const mobile = useScrollStore((s) => s.mobile);
  const { size, viewport } = useThree();
  const count = mobile ? 4 : BRANCHES.length;
  const node = useMemo(() => newBox(), []);
  const mark = useMemo(() => newBox(), []);

  const lines = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        geometry: createTubeGeometry(48, 5),
        curve: new THREE.CatmullRomCurve3(
          Array.from({ length: 5 }, () => new THREE.Vector3()),
          false,
          "centripetal",
        ),
      })),
    [count],
  );
  useEffect(() => () => lines.forEach((l) => l.geometry.dispose()), [lines]);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const anchor = scrollState.anchors.contactNode;
    const p = scrollState.contact;
    group.current.visible = p > 0.001 && !!anchor;
    if (!group.current.visible || !anchor) return;

    rectToWorld(anchor, size, viewport, node);
    rectToWorld(anchor.parentElement, size, viewport, mark);
    // Lines stop at the rim of the ring node, so its hole stays open.
    const rim = (MARK.nodeRadius / MARK.width) * mark.w * 0.9;
    const hw = viewport.width / 2;
    const hh = viewport.height / 2;
    const elbow = mobile ? 0.45 : 0.9;

    lines.forEach(({ geometry, curve }, i) => {
      const [fx, fy] = BRANCHES[i];
      const sx = fx * hw;
      const sy = fy * hh;
      const pts = curve.points;
      pts[0].set(sx, sy, 0);
      if (Math.abs(fx) > 1) {
        // Flat run toward the node, then one bend onto it.
        const ex = node.x + Math.sign(sx - node.x) * elbow;
        pts[1].set(sx + (ex - sx) * 0.6, sy, 0);
        pts[2].set(ex, sy, 0);
      } else {
        const ey = node.y + Math.sign(sy - node.y) * elbow;
        pts[1].set(sx, sy + (ey - sy) * 0.6, 0);
        pts[2].set(sx, ey, 0);
      }
      dir.set(pts[2].x - node.x, pts[2].y - node.y, 0).normalize();
      pts[3].set(node.x + dir.x * rim * 2.2, node.y + dir.y * rim * 2.2, 0);
      pts[4].set(node.x + dir.x * rim, node.y + dir.y * rim, 0);
      updateTube(geometry, curve, mobile ? 0.005 : 0.0065);
      setTubeDraw(geometry, smooth(i * 0.06, 0.55 + i * 0.06, p));
    });
  });

  return (
    <group ref={group} visible={false}>
      {lines.map((line, i) => (
        <mesh key={i} geometry={line.geometry} material={lineBlack} frustumCulled={false} />
      ))}
    </group>
  );
}
