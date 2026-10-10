"use client";

import { useEffect, useRef } from "react";
import { gsap, MQ, whenIdle } from "@/lib/gsap";
import { anchorRef, scrollState } from "@/lib/scroll-store";

export const FRAMES = [
  { name: "Round", stock: 24 },
  { name: "Aviator", stock: 12 },
  { name: "Wayfarer", stock: 31 },
];
const frameSlots = FRAMES.map((_, i) => anchorRef(`frame${i}`));

function TurnDeskVisual() {
  const chat = [
    { me: true, text: "Hi, can I see Dr. Mehta today?" },
    { me: false, text: "Yes. 10:30 AM or 4:15 PM are open." },
    { me: true, text: "10:30 AM please" },
    { me: false, text: "Booked for 10:30 AM. See you soon.", done: true },
  ];
  const list = [
    ["09:45", "R. Kulkarni"],
    ["10:30", "New booking"],
    ["11:00", "S. Patil"],
    ["11:30", "A. Deshmukh"],
  ];
  return (
    <div className="grid h-full gap-3 min-[560px]:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col justify-end gap-2 rounded-2xl bg-white p-4">
        <p className="mb-auto font-mono text-[10px] uppercase tracking-[0.08em] text-black/60">
          WhatsApp
        </p>
        {chat.map((m) => (
          <p
            key={m.text}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] font-medium leading-snug ${
              m.me ? "self-end bg-black text-white" : "self-start bg-black/[0.06]"
            }`}
          >
            {m.text}
            {m.done && <span className="ml-1.5 inline-block size-2 rounded-full bg-orange" />}
          </p>
        ))}
      </div>
      <div className="hidden flex-col rounded-2xl bg-white p-4 min-[560px]:flex">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-black/60">
          Today · 18 booked
        </p>
        <ul className="mt-3 flex flex-col">
          {list.map(([time, name], i) => (
            <li
              key={time}
              className="flex items-center gap-3 border-t border-black/10 py-2.5 text-[13px] font-medium"
            >
              <span className="font-mono text-[11px] text-black/60">{time}</span>
              <span className="flex-1">{name}</span>
              {i === 1 && <span className="size-2 rounded-full bg-orange" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TailorMartVisual() {
  const items = [
    ["Thread cones", "₹420"],
    ["Brass buttons", "₹180"],
    ["Zip rolls", "₹650"],
    ["Lining fabric", "₹95/m"],
    ["Measuring tape", "₹40"],
    ["Tailor's chalk", "₹60"],
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <ul className="grid flex-1 grid-cols-3 gap-2.5">
        {items.map(([name, price], i) => (
          <li key={name} className="flex flex-col justify-between rounded-2xl bg-white p-3">
            <span className={`size-7 rounded-full ${i === 2 ? "bg-orange" : "bg-black"}`} />
            <span>
              <span className="block text-[12px] font-bold leading-tight tracking-[-0.02em]">
                {name}
              </span>
              <span className="font-mono text-[10px] text-black/60">{price}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2.5 rounded-full bg-black px-4 py-3 font-mono text-[11px] uppercase tracking-[0.06em] text-white">
        <span className="size-2 rounded-full bg-orange" />
        Order #TM-1042 · Dispatched
      </p>
    </div>
  );
}

function OpticalVisual() {
  return (
    // Phones: one frame per row, so each has room. Wider screens: three columns.
    <ul className="grid h-full grid-rows-3 gap-2.5 min-[560px]:grid-cols-3 min-[560px]:grid-rows-1">
      {FRAMES.map((frame, i) => (
        <li
          key={frame.name}
          className="flex items-center gap-3 rounded-2xl bg-white p-3 min-[560px]:flex-col min-[560px]:items-stretch min-[560px]:gap-0"
        >
          {/* A 3D frame turns on a turntable in this slot */}
          <div
            ref={frameSlots[i]}
            data-cursor="ring"
            className="h-full w-[52%] flex-none min-[560px]:min-h-24 min-[560px]:w-auto min-[560px]:flex-1"
          />
          <div>
            <p className="text-[15px] font-bold tracking-[-0.02em] min-[560px]:text-[13px]">{frame.name}</p>
            <p className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.06em] text-black/60">
              {frame.stock} in stock
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const WORK = [
  {
    name: "TurnDesk",
    tag: "Clinics",
    text: "WhatsApp appointment booking plus a staff dashboard web app.",
    link: "turndesk.live",
    Visual: TurnDeskVisual,
  },
  {
    name: "TailorMart",
    tag: "Wholesale · Nashik",
    text: "A wholesale marketplace for tailoring supplies, with separate buyer and seller Android apps.",
    link: "tailormart.shop",
    Visual: TailorMartVisual,
  },
  {
    name: "Brandy Optical",
    tag: "Optical retail",
    text: "An online store plus a management system for more than one shop.",
    link: null,
    Visual: OpticalVisual,
  },
];

/**
 * Three sticky cards. Each new one slides over the last, and the one
 * underneath eases back to 0.94 and darkens slightly.
 */
export function ClientWork() {
  const section = useRef<HTMLElement>(null);

  useEffect(
    () =>
      whenIdle(() => {
        const mm = gsap.matchMedia();
        mm.add(MQ.motion, () => {
          const cards = gsap.utils.toArray<HTMLElement>(".work-card", section.current);
          cards.forEach((card, i) => {
            const next = cards[i + 1];
            if (!next) return;
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: next,
                  start: "top bottom",
                  end: "top 15%",
                  scrub: true,
                  onUpdate: () => scrollState.invalidate(),
                },
              })
              .to(card.querySelector(".work-inner"), { scale: 0.94 }, 0)
              .to(card.querySelector(".work-shade"), { opacity: 0.14 }, 0);
          });
        });
        return () => mm.revert();
      }),
    [],
  );

  return (
    <section
      ref={section}
      id="work"
      data-section="work"
      className="relative z-[2] bg-white px-5 py-24 desk:px-12 desk:py-40"
    >
      <p className="eyebrow text-black/60">Client work</p>
      <h2 className="display mt-6 max-w-[12ch] text-[clamp(2.5rem,7vw,7rem)]">
        Built for clients. Used every day.
      </h2>

      <div className="mt-14 desk:mt-24">
        {WORK.map(({ name, tag, text, link, Visual }, i) => (
          <article
            key={name}
            className="work-card sticky mb-[12svh] last:mb-0"
            style={{ top: `calc(${i * 14}px + 4.5rem)` }}
          >
            <div className="work-inner relative grid origin-top gap-6 overflow-hidden rounded-[2rem] bg-white p-5 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_-18px_50px_rgb(0_0_0/0.06)] desk:h-[min(74svh,40rem)] desk:grid-cols-[1fr_1.25fr] desk:gap-10 desk:p-10">
              <div className="flex flex-col">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
                  0{i + 1} · {tag}
                </p>
                <h3 className="display mt-4 text-[clamp(2.25rem,5vw,4.5rem)]">{name}</h3>
                <p className="mt-4 max-w-md text-base font-medium leading-snug text-black/60 desk:text-xl">
                  {text}
                </p>
                {link && (
                  <a
                    href={`https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline mt-6 self-start desk:mt-auto"
                  >
                    {link}
                    <span aria-hidden>↗</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
              <div className="h-[19rem] rounded-3xl bg-black/[0.04] p-3 desk:h-auto">
                <Visual />
              </div>
              <div
                aria-hidden
                className="work-shade pointer-events-none absolute inset-0 bg-black opacity-0"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
