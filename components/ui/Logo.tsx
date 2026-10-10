import { LogoMark } from "./LogoMark";

type Props = {
  /** `color` for white backgrounds, `white` for black ones. */
  variant?: "color" | "white";
  className?: string;
};

/**
 * Full logo: mark + wordmark. Sized by font-size.
 *
 * This is the single place the logo is drawn for the dock, footer and
 * preloader. To use the original artwork instead, drop the files in
 * /public/brand and return an <Image> here.
 */
export function Logo({ variant = "color", className = "" }: Props) {
  const white = variant === "white";
  return (
    <span
      className={`inline-flex items-center gap-[0.4em] font-extrabold leading-none tracking-[-0.04em] ${
        white ? "text-white" : "text-black"
      } ${className}`}
    >
      <LogoMark
        className={`h-[1.05em] w-auto flex-none ${white ? "text-white" : "text-orange"}`}
      />
      <span>
        Merge <span className={white ? undefined : "text-orange"}>&amp;</span>{" "}
        Main
      </span>
    </span>
  );
}
