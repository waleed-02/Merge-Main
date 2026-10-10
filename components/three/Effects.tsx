"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";

/**
 * Subtle bloom, desktop only. The threshold sits above anything the matte black
 * material can reflect, so only the emissive orange glows.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        intensity={0.45}
        radius={0.7}
        luminanceThreshold={0.19}
        luminanceSmoothing={0.04}
      />
    </EffectComposer>
  );
}
