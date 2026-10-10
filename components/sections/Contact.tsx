"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, MQ, whenIdle } from "@/lib/gsap";
import { MARK } from "@/lib/mark";
import { anchorRef, scrollState } from "@/lib/scroll-store";
import { site } from "@/lib/site";
import { LogoMark } from "@/components/ui/LogoMark";

const nodeSlot = anchorRef("contactNode");

const NEEDS = [
  "Scholarvale school ERP",
  "Custom ERP or CRM",
  "Dashboard",
  "Web app or online store",
  "Android app",
  "Automation or AI tool",
  "Not sure yet",
];
const BUDGETS = ["₹1–3 lakh", "₹3–5 lakh", "₹5–10 lakh", "₹10 lakh+", "Not sure yet"];

function buildMessage(data: FormData) {
  const get = (key: string) => String(data.get(key) ?? "").trim();
  return [
    "Hi Merge & Main,",
    "",
    `Name: ${get("name")}`,
    `School or business: ${get("org") || "-"}`,
    `What I need: ${get("need")}`,
    `Budget: ${get("budget") || "Not sure yet"}`,
    "",
    "How the work runs today:",
    get("today") || "-",
  ].join("\n");
}

/**
 * "Let's merge it to main." Thin branch lines converge on the logo's ring node
 * as you arrive (components/three/ConvergeScene.tsx). Like Process, this
 * section must not create a stacking context so the lines can run behind it.
 */
export function Contact() {
  const section = useRef<HTMLElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [budget, setBudget] = useState("");

  useEffect(
    () =>
      whenIdle(() => {
        const mm = gsap.matchMedia();
        mm.add(MQ.motion, () => {
          gsap.to(scrollState, {
            contact: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top 85%",
              end: "top 15%",
              scrub: true,
            },
          });
        });
        mm.add(MQ.reduced, () => {
          scrollState.contact = 1;
        });
        return () => mm.revert();
      }),
    [],
  );

  const mailto = (message: string) =>
    `mailto:${site.email}?subject=${encodeURIComponent("New project enquiry")}&body=${encodeURIComponent(message)}`;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = buildMessage(new FormData(e.currentTarget));
    // WhatsApp first; email if no number is configured or the popup is blocked.
    if (site.whatsapp) {
      const opened = window.open(
        `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
      if (opened) {
        opened.opener = null;
        return;
      }
    }
    window.location.href = mailto(message);
  };

  const onEmail = () => {
    if (!form.current?.reportValidity()) return;
    window.location.href = mailto(buildMessage(new FormData(form.current)));
  };

  return (
    <section ref={section} id="contact" data-section="contact" className="relative">
      <div className="relative z-[2] grid gap-14 px-5 py-24 desk:grid-cols-[1fr_1.05fr] desk:gap-20 desk:px-12 desk:py-40">
        <div>
          <div className="relative w-40 text-orange desk:w-56">
            <LogoMark title="Merge & Main" className="w-full" />
            {/* The branch lines end on this ring node */}
            <span
              ref={nodeSlot}
              aria-hidden
              className="absolute size-0"
              style={{
                left: `${(MARK.nodes[1][0] / MARK.width) * 100}%`,
                top: `${(MARK.nodes[1][1] / MARK.height) * 100}%`,
              }}
            />
          </div>
          <h2 className="display mt-10 text-[clamp(2.75rem,7vw,7rem)]">
            Let&rsquo;s merge it to <span className="text-orange">main.</span>
          </h2>
          <p className="mt-6 max-w-md text-base font-medium leading-snug text-black/60 desk:text-xl">
            Tell us how the work runs today. We will reply with what we would build first.
          </p>
          <dl className="mt-10 grid gap-5 font-medium desk:mt-16">
            {[
              [
                "Email",
                <a
                  key="e"
                  href={`mailto:${site.email}`}
                  className="inline-flex min-h-11 items-center underline decoration-black/20 underline-offset-4 hover:decoration-orange"
                >
                  {site.email}
                </a>,
              ],
              [
                "WhatsApp",
                site.whatsapp ? (
                  <a
                    key="w"
                    href={`https://wa.me/${site.whatsapp}`}
                    className="underline decoration-black/20 underline-offset-4 hover:decoration-orange"
                  >
                    {site.whatsappDisplay}
                  </a>
                ) : (
                  site.whatsappDisplay
                ),
              ],
              ["Based in", `${site.city}, India`],
            ].map(([label, value]) => (
              <div key={label as string} className="border-t border-black/10 pt-4">
                <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
                  {label}
                </dt>
                <dd className="mt-1 text-lg desk:text-xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <form
          ref={form}
          onSubmit={onSubmit}
          className="flex flex-col gap-6 self-start rounded-[2rem] bg-white p-5 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] desk:p-10"
        >
          <div className="grid gap-6 min-[560px]:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-bold">
              Name
              <input name="name" required autoComplete="name" className="field font-medium" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold">
              School or business
              <input name="org" autoComplete="organization" className="field font-medium" />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-bold">
            What do you need?
            <select name="need" defaultValue="Not sure yet" className="field font-medium">
              {NEEDS.map((need) => (
                <option key={need}>{need}</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-bold">Budget</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <label
                  key={b}
                  className={`flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm font-bold transition-colors duration-300 ease-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black ${
                    budget === b
                      ? "bg-orange text-black"
                      : "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.2)] hover:shadow-[inset_0_0_0_1px_#000]"
                  }`}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={b}
                    checked={budget === b}
                    onChange={() => setBudget(b)}
                    className="sr-only"
                  />
                  {b}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-2 text-sm font-bold">
            How does the work run today?
            <textarea
              name="today"
              rows={4}
              placeholder="Registers, Excel, WhatsApp groups…"
              className="field resize-y font-medium"
            />
          </label>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="submit" className="btn btn-primary">
              Send on WhatsApp
            </button>
            <button
              type="button"
              onClick={onEmail}
              className="min-h-11 text-sm font-bold underline decoration-black/20 underline-offset-4 hover:decoration-orange"
            >
              or send it by email
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
