"use client";

import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import { useScrollStore } from "@/lib/scroll-store";
import { Logo } from "./Logo";
import { LogoMark } from "./LogoMark";

/** Floating bottom nav. Slides away on scroll down, comes back on scroll up. */
export function Dock() {
  const active = useScrollStore((s) => s.active);
  const ready = useScrollStore((s) => s.ready);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Primary"
      className={`dock fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full bg-black p-1.5 pl-3 text-white min-[360px]:pl-4 transition-[translate,opacity] duration-500 ease-brand focus-within:translate-y-0 desk:gap-2 desk:pl-5 ${
        hidden || !ready ? "translate-y-[160%]" : "translate-y-0"
      } ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <a href="#top" aria-label="Merge & Main, back to top" className="flex min-h-11 flex-none items-center max-[359px]:hidden">
        <span className="hidden desk:block">
          <Logo variant="white" className="text-[15px]" />
        </span>
        <LogoMark className="h-5 w-auto text-white desk:hidden" />
      </a>
      <ul className="mx-1 flex items-center desk:mx-3">
        {NAV.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={item.href}
                aria-current={on ? "true" : undefined}
                className={`flex h-11 items-center gap-1.5 rounded-full px-2 font-mono text-[11px] min-[360px]:px-2.5 uppercase tracking-[0.08em] transition-colors duration-300 desk:px-3 ${
                  on ? "text-orange" : "text-white/70 hover:text-white"
                }`}
              >
                <span>{item.n}</span>
                <span className="sr-only min-[1100px]:not-sr-only">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <a href="#contact" className="btn btn-primary min-h-11 flex-none px-4 text-sm desk:px-5">
        <span className="desk:hidden">Start</span>
        <span className="hidden desk:inline">Start a project</span>
      </a>
    </nav>
  );
}
