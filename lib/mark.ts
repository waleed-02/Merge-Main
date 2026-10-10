/**
 * The Merge & Main logo mark, described once and shared by the SVG and the 3D
 * version. Two strands start on the left, curve together like a Y and run out
 * as one line to the right. A ring node sits at the start of the top strand and
 * at the end of the merged line; the strands stop short of the node centres so
 * the holes stay open.
 */
export const MARK = {
  width: 120,
  height: 64,
  stroke: 10,
  nodeRadius: 10,
  holeRadius: 3.6,
  top: "M24 16H36C52 16 50 32 66 32H96",
  bottom: "M14 48H36C52 48 50 32 66 32H96",
  nodes: [
    [14, 16],
    [106, 32],
  ],
} as const;

export const ORANGE = "#EC522C";

export function ringPath(cx: number, cy: number) {
  const o = MARK.nodeRadius;
  const i = MARK.holeRadius;
  return (
    `M${cx - o} ${cy}a${o} ${o} 0 1 0 ${o * 2} 0a${o} ${o} 0 1 0 ${-o * 2} 0Z` +
    `M${cx - i} ${cy}a${i} ${i} 0 1 0 ${i * 2} 0a${i} ${i} 0 1 0 ${-i * 2} 0Z`
  );
}

type Pt = [number, number];

function strandPolyline(which: "top" | "bottom"): Pt[] {
  const y0 = which === "top" ? 16 : 48;
  const x0 = which === "top" ? 24 : 14;
  const pts: Pt[] = [];
  for (let i = 0; i < 16; i++) pts.push([x0 + ((36 - x0) * i) / 16, y0]);
  const b: Pt[] = [
    [36, y0],
    [52, y0],
    [50, 32],
    [66, 32],
  ];
  for (let i = 0; i < 48; i++) {
    const t = i / 48;
    const m = 1 - t;
    pts.push([
      m * m * m * b[0][0] + 3 * m * m * t * b[1][0] + 3 * m * t * t * b[2][0] + t * t * t * b[3][0],
      m * m * m * b[0][1] + 3 * m * m * t * b[1][1] + 3 * m * t * t * b[2][1] + t * t * t * b[3][1],
    ]);
  }
  for (let i = 0; i <= 24; i++) pts.push([66 + (30 * i) / 24, 32]);
  return pts;
}

/** `count` points spaced evenly along a strand, in viewBox units. */
export function sampleStrand(which: "top" | "bottom", count: number): Pt[] {
  const poly = strandPolyline(which);
  const lengths = [0];
  for (let i = 1; i < poly.length; i++) {
    lengths.push(
      lengths[i - 1] +
        Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]),
    );
  }
  const total = lengths[lengths.length - 1];
  const out: Pt[] = [];
  let seg = 1;
  for (let k = 0; k < count; k++) {
    const d = (total * k) / (count - 1);
    while (seg < poly.length - 1 && lengths[seg] < d) seg++;
    const span = lengths[seg] - lengths[seg - 1] || 1;
    const t = (d - lengths[seg - 1]) / span;
    out.push([
      poly[seg - 1][0] + (poly[seg][0] - poly[seg - 1][0]) * t,
      poly[seg - 1][1] + (poly[seg][1] - poly[seg - 1][1]) * t,
    ]);
  }
  return out;
}

/** viewBox units → world units for a mark `width` world units wide, centred on 0,0. */
export function markToWorld(x: number, y: number, width: number): Pt {
  const k = width / MARK.width;
  return [(x - MARK.width / 2) * k, -(y - MARK.height / 2) * k];
}
