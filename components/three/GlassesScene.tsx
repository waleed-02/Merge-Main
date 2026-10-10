"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { FRAMES } from "@/components/sections/ClientWork";
import { scrollState, useScrollStore } from "@/lib/scroll-store";
import { glowOrange, matteBlack, newBox, rectToWorld } from "./shared";

const turntable = new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.08 });

/** A pair of frames from primitives: two rims, a bridge and two temples. */
function Frame({ style, material }: { style: number; material: THREE.Material }) {
  // Round, aviator (wider than tall) and wayfarer (squared-off rims).
  const rim = useMemo(
    () => new THREE.TorusGeometry(0.34, 0.05, 12, style === 2 ? 4 : 40),
    [style],
  );
  const rimScale: [number, number, number] = style === 1 ? [1.12, 0.9, 1] : [1, 1, 1];
  const rimTurn = style === 2 ? Math.PI / 4 : 0;
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            geometry={rim}
            material={material}
            position={[side * 0.43, 0, 0]}
            rotation={[0, 0, rimTurn]}
            scale={rimScale}
            castShadow
          />
          <mesh material={material} position={[side * 0.82, 0.08, -0.45]} castShadow>
            <boxGeometry args={[0.05, 0.07, 0.95]} />
          </mesh>
        </group>
      ))}
      <mesh material={material} position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.04, 0.12, 4, 10]} />
      </mesh>
    </group>
  );
}

/** Brandy Optical's frames, each turning slowly in its own slot on the card. */
export function GlassesScene() {
  const reduced = useScrollStore((s) => s.reduced);
  const { size, viewport } = useThree();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const spins = useRef<(THREE.Group | null)[]>([]);
  const box = useMemo(() => newBox(), []);

  useFrame((state) => {
    let any = false;
    FRAMES.forEach((_, i) => {
      const g = groups.current[i];
      const spin = spins.current[i];
      if (!g || !spin) return;
      rectToWorld(scrollState.anchors[`frame${i}`], size, viewport, box);
      g.visible = box.visible;
      if (!box.visible) return;
      any = true;
      g.position.set(box.x, box.y, 0);
      g.scale.setScalar(Math.min(box.w / 2.05, box.h / 1.6));
      spin.rotation.y = reduced ? 0.55 : state.clock.elapsedTime * 0.5 + i * 2.1;
    });
    if (any && !reduced) state.invalidate();
  });

  return (
    <>
      {FRAMES.map((frame, i) => (
        <group
          key={frame.name}
          ref={(el) => {
            groups.current[i] = el;
          }}
          visible={false}
          rotation={[0.3, 0, 0]}
        >
          <group
            ref={(el) => {
              spins.current[i] = el;
            }}
          >
            <group position={[0, 0.12, 0.2]}>
              <Frame style={i} material={i === 1 ? glowOrange : matteBlack} />
            </group>
            <mesh material={turntable} position={[0, -0.42, 0]}>
              <cylinderGeometry args={[0.95, 0.95, 0.04, 48]} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}
