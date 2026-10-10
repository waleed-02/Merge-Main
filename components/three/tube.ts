import * as THREE from "three";

/**
 * A tube whose vertices are rewritten in place, so curves can morph every frame
 * without allocating a new TubeGeometry.
 */
export function createTubeGeometry(segments: number, radial: number) {
  const geo = new THREE.BufferGeometry();
  const count = (segments + 1) * (radial + 1);
  const position = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const normal = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  position.setUsage(THREE.DynamicDrawUsage);
  normal.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", position);
  geo.setAttribute("normal", normal);

  const index: number[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = (i + 1) * (radial + 1) + j;
      index.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  geo.setIndex(index);
  geo.userData = { segments, radial };
  return geo;
}

let pts = new Float32Array(0);
const P = new THREE.Vector3();
const T = new THREE.Vector3();
const N = new THREE.Vector3();
const B = new THREE.Vector3();
const AXIS_Z = new THREE.Vector3(0, 0, 1);
const AXIS_Y = new THREE.Vector3(0, 1, 0);

/** Sweeps a circle of `radius` along `curve` and writes it into `geo`. */
export function updateTube(
  geo: THREE.BufferGeometry,
  curve: THREE.Curve<THREE.Vector3>,
  radius: number,
) {
  const { segments, radial } = geo.userData as { segments: number; radial: number };
  const position = geo.attributes.position as THREE.BufferAttribute;
  const normal = geo.attributes.normal as THREE.BufferAttribute;
  const pos = position.array as Float32Array;
  const nor = normal.array as Float32Array;

  if (pts.length < (segments + 1) * 3) pts = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i++) {
    curve.getPoint(i / segments, P);
    pts[i * 3] = P.x;
    pts[i * 3 + 1] = P.y;
    pts[i * 3 + 2] = P.z;
  }

  let v = 0;
  for (let i = 0; i <= segments; i++) {
    const a = Math.max(i - 1, 0) * 3;
    const b = Math.min(i + 1, segments) * 3;
    T.set(pts[b] - pts[a], pts[b + 1] - pts[a + 1], pts[b + 2] - pts[a + 2]).normalize();

    // Parallel transport: carry the previous normal along, re-squared to the tangent.
    if (i === 0) {
      N.crossVectors(AXIS_Z, T);
      if (N.lengthSq() < 1e-6) N.crossVectors(AXIS_Y, T);
    } else {
      N.addScaledVector(T, -N.dot(T));
    }
    N.normalize();
    B.crossVectors(T, N);

    const px = pts[i * 3];
    const py = pts[i * 3 + 1];
    const pz = pts[i * 3 + 2];
    for (let j = 0; j <= radial; j++) {
      const angle = (j / radial) * Math.PI * 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const nx = c * N.x + s * B.x;
      const ny = c * N.y + s * B.y;
      const nz = c * N.z + s * B.z;
      nor[v] = nx;
      nor[v + 1] = ny;
      nor[v + 2] = nz;
      pos[v] = px + nx * radius;
      pos[v + 1] = py + ny * radius;
      pos[v + 2] = pz + nz * radius;
      v += 3;
    }
  }
  position.needsUpdate = true;
  normal.needsUpdate = true;
}

/** Shows only the first `t` (0–1) of the tube's length. */
export function setTubeDraw(geo: THREE.BufferGeometry, t: number) {
  const { segments, radial } = geo.userData as { segments: number; radial: number };
  geo.setDrawRange(0, Math.round(segments * Math.max(0, Math.min(1, t))) * radial * 6);
}
