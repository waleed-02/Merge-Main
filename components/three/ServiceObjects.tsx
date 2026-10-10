"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { scrollState } from "@/lib/scroll-store";
import { glowOrange, matteBlack } from "./shared";

/* Six small objects, all from the same matte black + orange. */

function School() {
  return (
    <group position={[0, -0.15, 0]}>
      <mesh material={matteBlack}>
        <boxGeometry args={[1.1, 0.6, 0.7]} />
      </mesh>
      <mesh material={matteBlack} position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.85, 0.42, 4]} />
      </mesh>
      <mesh material={glowOrange} position={[0, -0.1, 0.355]}>
        <boxGeometry args={[0.2, 0.4, 0.02]} />
      </mesh>
    </group>
  );
}

function LinkedNodes() {
  const pts: [number, number, number][] = [
    [-0.5, -0.3, 0],
    [0.5, -0.25, 0.1],
    [0, 0.45, -0.1],
  ];
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p} material={i === 2 ? glowOrange : matteBlack}>
          <sphereGeometry args={[0.2, 24, 16]} />
        </mesh>
      ))}
      {pts.map((p, i) => {
        const a = new THREE.Vector3(...p);
        const b = new THREE.Vector3(...pts[(i + 1) % 3]);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          b.clone().sub(a).normalize(),
        );
        return (
          <mesh key={`l${i}`} position={mid} quaternion={q} material={matteBlack}>
            <cylinderGeometry args={[0.04, 0.04, a.distanceTo(b), 10]} />
          </mesh>
        );
      })}
    </group>
  );
}

function BarChart() {
  const bars = [0.45, 0.75, 1.1];
  return (
    <group position={[0, -0.5, 0]}>
      {bars.map((h, i) => (
        <mesh key={i} position={[(i - 1) * 0.42, h / 2, 0]} material={i === 2 ? glowOrange : matteBlack}>
          <boxGeometry args={[0.3, h, 0.3]} />
        </mesh>
      ))}
      <mesh material={matteBlack} position={[0, -0.03, 0]}>
        <boxGeometry args={[1.35, 0.06, 0.5]} />
      </mesh>
    </group>
  );
}

function Browser() {
  return (
    <group>
      <RoundedBox args={[1.4, 0.95, 0.1]} radius={0.07} smoothness={3} material={matteBlack} />
      <mesh material={glowOrange} position={[0, 0.33, 0.052]}>
        <boxGeometry args={[1.22, 0.14, 0.01]} />
      </mesh>
    </group>
  );
}

function Phone() {
  return (
    <group>
      <RoundedBox args={[0.62, 1.25, 0.09]} radius={0.08} smoothness={3} material={matteBlack} />
      <mesh material={glowOrange} position={[0, 0.3, 0.047]}>
        <boxGeometry args={[0.44, 0.36, 0.01]} />
      </mesh>
    </group>
  );
}

function Spark() {
  return (
    <group>
      <mesh material={glowOrange} scale={[0.22, 0.75, 0.22]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh material={glowOrange} scale={[0.75, 0.22, 0.22]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
    </group>
  );
}

const OBJECTS = [School, LinkedNodes, BarChart, Browser, Phone, Spark];

/** The small object that trails the cursor over the hovered services row. */
export function ServiceObjects() {
  const { size, viewport } = useThree();
  const root = useRef<THREE.Group>(null);
  const items = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const dt = Math.min(delta, 0.05);
    const active = scrollState.service;
    const k = viewport.width / size.width;
    const tx = (scrollState.mouse.x + 110 - size.width / 2) * k;
    const ty = -(scrollState.mouse.y - 10 - size.height / 2) * k;
    const p = root.current.position;
    p.x = THREE.MathUtils.damp(p.x, tx, 7, dt);
    p.y = THREE.MathUtils.damp(p.y, ty, 7, dt);
    root.current.rotation.y += dt * 0.9;

    let moving = Math.abs(p.x - tx) + Math.abs(p.y - ty) > 0.002;
    items.current.forEach((g, i) => {
      if (!g) return;
      const target = i === active ? 1 : 0;
      const s = THREE.MathUtils.damp(g.scale.x, target, 10, dt);
      g.scale.setScalar(s);
      g.visible = s > 0.01;
      if (Math.abs(s - target) > 0.005) moving = true;
    });
    if (moving || active >= 0) state.invalidate();
  });

  return (
    <group ref={root} scale={0.62} rotation={[0.25, 0, 0]}>
      {OBJECTS.map((Obj, i) => (
        <group
          key={i}
          ref={(el) => {
            items.current[i] = el;
          }}
          scale={0}
          visible={false}
        >
          <Obj />
        </group>
      ))}
    </group>
  );
}
