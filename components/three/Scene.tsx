"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { scrollState, useScrollStore } from "@/lib/scroll-store";
import { HeroScene } from "./HeroScene";
import { PhoneScene } from "./PhoneScene";
import { GlassesScene } from "./GlassesScene";
import { ServiceObjects } from "./ServiceObjects";
import { ProcessScene } from "./ProcessScene";
import { ConvergeScene } from "./ConvergeScene";
import { Effects } from "./Effects";

/** Lets DOM code (scroll, pointer) ask the demand-driven canvas for a frame. */
function Bridge() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    scrollState.invalidate = () => invalidate();
    invalidate();
    return () => {
      scrollState.invalidate = () => {};
    };
  }, [invalidate]);
  return null;
}

/** Soft studio light: one key with a gentle shadow, plus softboxes for reflections. */
function Studio({ shadows }: { shadows: boolean }) {
  // `shadows` doubles as "desktop": shadows and reflections are both desktop-only.
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-2, 4, 10]}
        intensity={1.2}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-radius={5}
        shadow-bias={-0.0004}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      {shadows ? (
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={3} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
          <Lightformer form="rect" intensity={1.6} position={[-7, 1, 3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={1} position={[7, -1, 4]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={0.6} position={[0, 0, 9]} scale={[10, 10, 1]} />
        </Environment>
      ) : (
        // Phones skip the reflection probe: it is the costliest thing to set up.
        <hemisphereLight args={["#ffffff", "#000000", 1.4]} />
      )}
    </>
  );
}

/**
 * The one canvas for the whole page, fixed to the viewport. It only renders
 * when something asks it to (scroll, pointer, or a scene that is animating).
 */
export default function Scene() {
  const mobile = useScrollStore((s) => s.mobile);
  const front = useScrollStore((s) => s.canvasFront);
  const inView = useScrollStore((s) => s.inView);

  return (
    <div
      aria-hidden
      className="fade-in pointer-events-none fixed inset-x-0 top-0 h-lvh"
      style={{ zIndex: front ? 3 : 1 }}
    >
      <Canvas
        frameloop="demand"
        flat
        shadows={mobile ? false : "soft"}
        dpr={mobile ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 60 }}
        style={{ pointerEvents: "none" }}
      >
        <Bridge />
        <Studio shadows={!mobile} />
        {/* Scenes show and hide by section */}
        <HeroScene />
        {inView.scholarvale && <PhoneScene />}
        {inView.work && <GlassesScene />}
        {inView.services && !mobile && <ServiceObjects />}
        {inView.process && <ProcessScene />}
        {inView.contact && <ConvergeScene />}
        {!mobile && <Effects />}
      </Canvas>
    </div>
  );
}
