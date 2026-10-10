"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { PARENT_ALERTS } from "@/components/sections/Scholarvale";
import { scrollState, useScrollStore } from "@/lib/scroll-store";
import { matteBlack, newBox, rectToWorld, smooth } from "./shared";

const START = (-22 * Math.PI) / 180;
/** drei renders `<Html transform>` at 40 CSS px per world unit. */
const PX = 1 / 40;
const SCREEN_W = 300;
const SCREEN_H = 632;

/**
 * A floating badge. It is an HTML pill carried on a 3D transform, so it can
 * pass in front of the phone's (also HTML) screen and its text stays real text.
 */
function Badge({ label, mobile }: { label: string; mobile: boolean }) {
  return (
    <Html transform scale={(mobile ? 0.62 : 0.86) / (230 * PX)} zIndexRange={[9, 6]} style={{ pointerEvents: "none" }}>
      <div
        aria-hidden
        className="flex w-[230px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-black py-3 font-mono text-[14px] uppercase tracking-[0.06em] text-white shadow-[0_10px_24px_rgb(0_0_0/0.18)]"
      >
        <span className="size-2 flex-none rounded-full bg-orange" />
        {label}
      </div>
    </Html>
  );
}
/**
 * The parent-app phone. It stands in the slot the Scholarvale section leaves
 * for it, turns from -22° to face-on as it arrives, and its screen is real HTML.
 */
export function PhoneScene() {
  const mobile = useScrollStore((s) => s.mobile);
  const reduced = useScrollStore((s) => s.reduced);
  const { size, viewport } = useThree();
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const badges = useRef<(THREE.Group | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const box = useMemo(() => newBox(), []);

  useFrame((state) => {
    if (!root.current || !body.current) return;
    rectToWorld(scrollState.anchors.phone, size, viewport, box);
    root.current.position.set(box.x, box.y, 0);
    root.current.scale.setScalar(Math.max(box.h / 2, 0.0001));

    // 0 as the slot enters the viewport, 1 once it is centred.
    const enter = reduced
      ? 1
      : mobile
        ? smooth(-viewport.height * 0.55, -viewport.height * 0.05, box.y)
        : 1 - smooth(0, viewport.width * 0.55, box.x);
    body.current.rotation.y = START * (1 - enter);

    cards.current.forEach((el, i) => {
      if (!el) return;
      const t = smooth(0.3 + i * 0.14, 0.52 + i * 0.14, enter);
      el.style.opacity = String(t);
      el.style.transform = `translateY(${(t - 1) * 28}px)`;
    });

    const time = reduced ? 0 : state.clock.elapsedTime;
    const reach = mobile ? 0.36 : 1.0;
    badges.current.forEach((g, i) => {
      if (!g) return;
      const side = i === 0 ? -1 : 1;
      const a = time * 0.9 + i * 2.4;
      g.position.set(
        side * reach + Math.cos(a) * 0.07,
        (i === 0 ? (mobile ? 0.86 : 0.52) : mobile ? -0.84 : -0.38) + Math.sin(a) * 0.06,
        0.22 + Math.sin(a * 0.7) * 0.06,
      );
      g.rotation.y = -side * 0.22 + Math.sin(a) * 0.08;
      g.scale.setScalar(smooth(0.75, 1, enter));
    });

    // Keep the badges orbiting while the phone is on screen.
    if (!reduced && box.visible) state.invalidate();
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <RoundedBox args={[0.98, 2, 0.1]} radius={0.11} smoothness={5} material={matteBlack} castShadow />
        <Html
          transform
          position={[0, 0, 0.052]}
          scale={0.9 / (SCREEN_W * PX)}
          zIndexRange={[4, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            aria-hidden
            style={{ width: SCREEN_W, height: SCREEN_H }}
            className="flex flex-col overflow-hidden rounded-[30px] bg-white text-black"
          >
            <div className="bg-orange px-5 pb-5 pt-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em]">Scholarvale · Parent</p>
              <p className="mt-2 text-[22px] font-extrabold leading-none tracking-[-0.04em]">Aarav Sharma</p>
              <p className="mt-1.5 text-[13px] font-medium">Class 7B</p>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-3.5">
              <p className="px-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-black/60">Today</p>
              {PARENT_ALERTS.map((alert, i) => (
                <div
                  key={alert.title}
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  className="rounded-2xl bg-black/[0.05] p-3.5"
                >
                  <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-black/60">
                    <span className="size-1.5 rounded-full bg-orange" />
                    {alert.tag}
                  </p>
                  <p className="mt-1.5 text-[15px] font-bold leading-tight tracking-[-0.02em]">{alert.title}</p>
                  <p className="mt-0.5 text-[12px] font-medium leading-snug text-black/60">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Html>
      </group>
      {["WhatsApp alert sent", "SMS delivered"].map((label, i) => (
        <group
          key={label}
          ref={(el) => {
            badges.current[i] = el;
          }}
        >
          <Badge label={label} mobile={mobile} />
        </group>
      ))}
      {!mobile && (
        <mesh position={[0, 0, -0.1]} receiveShadow>
          <planeGeometry args={[8, 6]} />
          <shadowMaterial transparent opacity={0.13} />
        </mesh>
      )}
    </group>
  );
}
