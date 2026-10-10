import { MARK, ringPath } from "@/lib/mark";

type Props = {
  className?: string;
  /** Accessible name. Leave empty when the mark sits next to the wordmark. */
  title?: string;
  /**
   * Render in the "not drawn yet" state so it can draw itself on: animate
   * `strokeDashoffset` to 0 on `.mm-strand`, then scale `.mm-node` up from 0.
   */
  undrawn?: boolean;
};

/** The logo mark as stroke paths. Colour comes from `currentColor`. */
export function LogoMark({ className, title, undrawn }: Props) {
  return (
    <svg
      viewBox={`0 0 ${MARK.width} ${MARK.height}`}
      className={className}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {[MARK.top, MARK.bottom].map((d) => (
        <path
          key={d}
          className="mm-strand"
          d={d}
          pathLength={1}
          stroke="currentColor"
          strokeWidth={MARK.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={undrawn ? 1 : undefined}
          strokeDashoffset={undrawn ? 1 : undefined}
        />
      ))}
      {MARK.nodes.map(([x, y]) => (
        <path
          key={x}
          className="mm-node"
          d={ringPath(x, y)}
          fill="currentColor"
          fillRule="evenodd"
          opacity={undrawn ? 0 : undefined}
        />
      ))}
    </svg>
  );
}
