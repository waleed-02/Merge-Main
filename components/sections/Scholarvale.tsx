"use client";

import { useEffect, useRef } from "react";
import { gsap, MQ, whenIdle } from "@/lib/gsap";
import { anchorRef, scrollState } from "@/lib/scroll-store";
import { useInView } from "@/lib/use-in-view";

const phoneSlot = anchorRef("phone");

const FACTS = [
  ["2 weeks", "about how long setup takes"],
  ["6 modules", "in one system"],
  ["WhatsApp + SMS", "parent alerts"],
];

export const PARENT_ALERTS = [
  { title: "Marked present", detail: "Aarav reached school at 8:42 AM", tag: "Attendance" },
  { title: "Term 2 fee due", detail: "₹18,500 due on 15 Oct", tag: "Fees" },
  { title: "Bus 4 is 10 minutes away", detail: "Arriving at your stop soon", tag: "Transport" },
  { title: "Unit test marks published", detail: "Tap to view the report", tag: "Academics" },
];

/* The six tiny module visuals, black and orange only. */

function Funnel() {
  const rows = [
    ["Enquiries", 248, 100],
    ["Applied", 131, 53],
    ["Admitted", 96, 39],
  ] as const;
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map(([label, n, w], i) => (
        <div
          key={label}
          className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.06em]"
        >
          <span className="w-20 text-black/60">{label}</span>
          <span className="h-3 flex-1">
            <span
              className={`grow-x block h-full rounded-full ${i === 2 ? "bg-orange" : "bg-black"}`}
              style={{ width: `${w}%`, "--i": i } as React.CSSProperties}
            />
          </span>
          <span className="w-8 text-right">{n}</span>
        </div>
      ))}
    </div>
  );
}

function DotGrid() {
  const absent = [5, 13, 22, 30];
  return (
    <div>
      <div className="grid grid-cols-9 gap-1.5">
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            className={`pop aspect-square rounded-full ${absent.includes(i) ? "bg-orange" : "bg-black"}`}
            style={{ "--i": i % 9 } as React.CSSProperties}
          />
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-black/60">
        Class 7B · 32 present · 4 absent
      </p>
    </div>
  );
}

function MarksBars() {
  const bars = [62, 78, 54, 91, 70, 84];
  return (
    <div>
      <div className="flex h-24 items-end gap-2">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`grow-y flex-1 rounded-t-md ${i === 3 ? "bg-orange" : "bg-black"}`}
            style={{ height: `${h}%`, "--i": i } as React.CSSProperties}
          />
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-black/60">
        Unit test 2 · Science highest
      </p>
    </div>
  );
}

function CollectionBar() {
  return (
    <div>
      <p className="display text-5xl">72%</p>
      <div className="mt-3 h-3 rounded-full bg-black/10">
        <span className="grow-x block h-full w-[72%] rounded-full bg-orange" />
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-black/60">
        Term 2 collected
      </p>
    </div>
  );
}

function RouteLine() {
  return (
    <div>
      <svg viewBox="0 0 260 80" className="w-full" aria-hidden>
        <path
          d="M10 60C50 60 50 20 90 20s40 36 80 36 40-30 80-30"
          fill="none"
          stroke="#000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {[
          [10, 60],
          [90, 20],
          [250, 26],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="6" fill="#fff" stroke="#000" strokeWidth="3" />
        ))}
        <circle cx="170" cy="56" r="9" fill="#EC522C" />
      </svg>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-black/60">
        Bus 4 · 2 stops away
      </p>
    </div>
  );
}

function Avatars() {
  const people = ["RK", "SM", "AP", "NJ", "VD"];
  return (
    <div>
      <div className="flex">
        {people.map((p, i) => (
          <span
            key={p}
            className={`pop -ml-2 grid size-12 place-items-center rounded-full font-mono text-xs shadow-[0_0_0_3px_#fff] first:ml-0 ${
              i === 0 ? "bg-orange text-black" : "bg-black text-white"
            }`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {p}
          </span>
        ))}
        <span className="pop -ml-2 grid size-12 place-items-center rounded-full bg-white font-mono text-xs shadow-[0_0_0_3px_#fff,inset_0_0_0_1.5px_#000]">
          +37
        </span>
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-black/60">
        42 staff · payroll on the 1st
      </p>
    </div>
  );
}

const MODULES = [
  {
    name: "Admissions",
    text: "Enquiry to enrolment, with every follow-up tracked.",
    Visual: Funnel,
  },
  { name: "Attendance", text: "Marked in seconds. Parents know the same minute.", Visual: DotGrid },
  { name: "Academics", text: "Timetables, exams, marks and report cards.", Visual: MarksBars },
  {
    name: "Fees",
    text: "Invoices, receipts, reminders and dues in one view.",
    Visual: CollectionBar,
  },
  { name: "Transport", text: "Routes, stops and live bus alerts for parents.", Visual: RouteLine },
  { name: "HR", text: "Staff records, leave and payroll.", Visual: Avatars },
];

function ModuleCard({ index, name, text, Visual }: (typeof MODULES)[number] & { index: number }) {
  const ref = useInView<HTMLElement>();

  // Tilt toward the cursor.
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--ry", `${x * 12}deg`);
    e.currentTarget.style.setProperty("--rx", `${-y * 12}deg`);
  };
  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--ry", "0deg");
    e.currentTarget.style.setProperty("--rx", "0deg");
  };

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="viz tilt flex h-full w-full flex-col gap-8 desk:min-h-[23rem] justify-between rounded-3xl bg-white p-7 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] pin:h-[min(62svh,30rem)] pin:w-[min(30vw,24rem)]"
    >
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
          Module 0{index + 1}
        </p>
        <h3 className="display mt-3 text-4xl">{name}</h3>
        <p className="mt-3 text-[15px] font-medium leading-snug text-black/60">{text}</p>
      </div>
      <div className="mt-8">
        <Visual />
      </div>
    </article>
  );
}

/**
 * Pinned horizontal scroll on desktop: vertical scroll drives the track.
 * On mobile and with reduced motion it is a plain vertical stack.
 */
export function Scholarvale() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      whenIdle(() => {
        const mm = gsap.matchMedia();
        mm.add(MQ.desktop, () => {
          const el = track.current!;
          gsap.to(el, {
            x: () => -(el.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
                scrollState.invalidate();
              },
            },
          });
        });
        return () => mm.revert();
      }),
    [],
  );

  return (
    <section
      ref={section}
      id="scholarvale"
      data-section="scholarvale"
      className="relative z-[2] bg-white pin:h-[600vh]"
    >
      <div className="pin:sticky pin:top-0 pin:h-svh pin:overflow-hidden">
        <div
          ref={track}
          className="flex flex-col pin:h-full pin:w-max pin:flex-row pin:items-center"
        >
          {/* Panel 1 */}
          <div className="flex flex-col justify-center px-5 py-24 pin:h-full pin:w-screen pin:py-0 desk:px-12">
            <p className="eyebrow text-black/60">Our product · School ERP</p>
            <p className="mt-6 text-base font-medium text-black/60 desk:text-lg">
              For CBSE, ICSE and state board schools
            </p>
            <h2 className="display mt-2 text-[16.2vw] leading-[0.95] desk:text-[15.5vw] desk:leading-[0.9]">
              Scholarvale
            </h2>
            <div className="mt-8 grid gap-10 desk:grid-cols-[1.1fr_1.4fr] desk:items-end">
              <p className="max-w-xl text-lg font-medium leading-snug desk:text-2xl">
                One ERP that runs the whole school, from admissions to HR, with a parent app that
                sends WhatsApp and SMS alerts.
              </p>
              <dl className="grid gap-6 min-[560px]:grid-cols-3">
                {FACTS.map(([value, label]) => (
                  <div key={value} className="border-t border-black/10 pt-4">
                    <dt className="display text-2xl desk:text-3xl">{value}</dt>
                    <dd className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-black/60">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Panel 2: the 3D phone stands in this slot */}
          <div className="flex flex-col items-center justify-center gap-6 px-5 pb-24 pin:h-full pin:w-[64vw] pin:pb-0">
            <p className="eyebrow text-black/60">Parent app</p>
            <div
              ref={phoneSlot}
              data-cursor="ring"
              className="aspect-[98/200] h-[min(64svh,34rem)]"
            />
            <ul className="sr-only">
              <li>Parent app for Aarav Sharma, Class 7B.</li>
              {PARENT_ALERTS.map((a) => (
                <li key={a.title}>
                  {a.title}. {a.detail}.
                </li>
              ))}
              <li>WhatsApp alert sent. SMS delivered.</li>
            </ul>
          </div>

          {/* Panels 3–8 */}
          <ul className="grid grid-cols-1 gap-4 px-5 min-[560px]:grid-cols-2 pin:flex pin:h-full pin:items-center pin:gap-6 desk:px-12">
            {MODULES.map((m, i) => (
              <li key={m.name} className="min-w-0">
                <ModuleCard index={i} {...m} />
              </li>
            ))}
          </ul>

          {/* Last panel */}
          <div className="flex flex-col items-start justify-center px-5 py-24 pin:h-full pin:w-[80vw] pin:py-0 desk:px-12">
            <h3 className="display max-w-[14ch] text-[clamp(2.25rem,6vw,6rem)]">
              Most schools go live in about <span className="text-orange">two weeks.</span>
            </h3>
            <a href="#contact" className="btn btn-primary mt-10">
              Book a Scholarvale demo
            </a>
          </div>
        </div>
        <div
          ref={bar}
          aria-hidden
          style={{ transform: "scaleX(0)" }}
          className="absolute inset-x-0 bottom-0 hidden h-[3px] origin-left bg-orange pin:block"
        />
      </div>
    </section>
  );
}
