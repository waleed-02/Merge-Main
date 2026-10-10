import { ImageResponse } from "next/og";
import { MARK, ORANGE, ringPath } from "@/lib/mark";
import { site } from "@/lib/site";

export const alt = "Merge & Main. Ideas branch off. We merge them to main.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Built from the logo mark's own paths, so it always matches the site. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          color: "#000000",
          padding: 72,
        }}
      >
        <svg width={300} height={160} viewBox={`0 0 ${MARK.width} ${MARK.height}`} fill="none">
          {[MARK.top, MARK.bottom].map((d) => (
            <path key={d} d={d} stroke={ORANGE} strokeWidth={MARK.stroke} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {MARK.nodes.map(([x, y]) => (
            <path key={x} d={ringPath(x, y)} fill={ORANGE} fillRule="evenodd" />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 148, fontWeight: 800, letterSpacing: -7, lineHeight: 1 }}>
            Merge
            <span style={{ color: ORANGE, margin: "0 28px" }}>&amp;</span>
            Main
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 40, opacity: 0.6 }}>{site.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
