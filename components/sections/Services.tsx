"use client";

import { useState } from "react";
import { scrollState } from "@/lib/scroll-store";

const SERVICES = [
  {
    name: "School ERP",
    labels: ["Scholarvale", "Admissions to HR", "Parent app"],
    text: "Scholarvale, set up for your school: your classes, fee structure, routes and report card formats.",
  },
  {
    name: "ERPs & CRMs",
    labels: ["Inventory", "Billing", "Leads & follow-ups"],
    text: "One system for stock, orders, billing and customers, shaped around the way your team already works.",
  },
  {
    name: "Dashboards",
    labels: ["Live numbers", "Roles", "Exports"],
    text: "The numbers you check every morning, on one screen, pulled from the tools you already use.",
  },
  {
    name: "Web apps",
    labels: ["Portals", "Online stores", "Booking"],
    text: "Customer portals, online stores and booking flows that are fast on a phone and easy to run.",
  },
  {
    name: "Android apps",
    labels: ["Buyer & seller apps", "Staff apps", "Play Store"],
    text: "Apps for your customers and your staff, built for the mid-range phones they actually carry.",
  },
  {
    name: "Automation & AI",
    labels: ["WhatsApp flows", "Reminders", "Document reading"],
    text: "Reminders, replies and data entry that run on their own, so your team stops copying things by hand.",
  },
];

/** Tells the 3D scene which row the cursor is over (-1 for none). */
function hover(i: number) {
  scrollState.service = i;
  scrollState.invalidate();
}

/**
 * Six oversized rows. On desktop a small 3D object follows the cursor over the
 * hovered row (components/three/ServiceObjects.tsx); every row also expands on
 * tap or click.
 */
export function Services() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="services"
      data-section="services"
      className="relative z-[2] bg-white px-5 py-24 desk:px-12 desk:py-40"
    >
      <p className="eyebrow text-black/60">Services</p>
      <h2 className="display mt-6 max-w-[14ch] text-[clamp(2.5rem,7vw,7rem)]">
        Software, built around your process.
      </h2>

      <ul className="mt-14 border-b border-black/10 desk:mt-24" onPointerLeave={() => hover(-1)}>
        {SERVICES.map((service, i) => {
          const expanded = open === i;
          return (
            <li key={service.name} className="border-t border-black/10">
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`service-${i}`}
                  onClick={() => setOpen(expanded ? null : i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover(i)}
                  className="group flex w-full items-baseline gap-4 py-6 text-left desk:gap-10 desk:py-9"
                >
                  <span className="w-7 font-mono text-xs text-black/60 transition-colors duration-300 ease-brand group-hover:text-orange group-aria-expanded:text-orange desk:w-10 desk:text-sm desk:group-hover:font-medium">
                    0{i + 1}
                  </span>
                  <span className="display flex-1 text-[clamp(2rem,7.2vw,7rem)] transition-transform duration-500 ease-brand desk:group-hover:translate-x-6">
                    {service.name}
                  </span>
                  <span className="hidden max-w-[15rem] flex-wrap justify-end gap-x-3 gap-y-1 self-center font-mono text-[11px] uppercase tracking-[0.08em] text-black/60 desk:flex">
                    {service.labels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </span>
                  <span
                    aria-hidden
                    className="relative size-4 flex-none self-center before:absolute before:inset-x-0 before:top-1/2 before:h-0.5 before:-translate-y-1/2 before:bg-black after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-black after:transition-transform after:duration-300 after:ease-brand group-aria-expanded:after:scale-y-0"
                  />
                </button>
              </h3>
              <div
                id={`service-${i}`}
                className={`grid transition-[grid-template-rows] duration-500 ease-brand ${
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className={`overflow-hidden ${expanded ? "visible" : "invisible"}`}>
                  <div className="pb-7 pl-11 desk:pb-10 desk:pl-20">
                    <p className="max-w-xl text-base font-medium leading-snug text-black/60 desk:text-xl">
                      {service.text}
                    </p>
                    <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60 desk:hidden">
                      {service.labels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
