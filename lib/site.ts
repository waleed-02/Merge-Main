/** Everything you are likely to edit before launch lives here. */
export const site = {
  name: "Merge & Main",
  tagline: "Ideas branch off. We merge them to main.",
  title: "Merge & Main — Product studio, India",
  description:
    "Merge & Main is a product studio from India. We build Scholarvale, a school ERP for K-12 schools, and custom ERPs, CRMs, dashboards, web and Android apps built around how you work.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mergeandmain.com",
  email: "mergemainhq@gmail.com",
  /** Digits only with country code, e.g. "919876543210". Leave empty until you have one. */
  whatsapp: "",
  /** How the number is shown on the page, e.g. "+91 98765 43210". */
  whatsappDisplay: "[YOUR NUMBER]",
  city: "[YOUR CITY]",
};

export const NAV = [
  { n: "01", label: "Scholarvale", href: "#scholarvale", id: "scholarvale" },
  { n: "02", label: "Work", href: "#work", id: "work" },
  { n: "03", label: "Services", href: "#services", id: "services" },
  { n: "04", label: "Process", href: "#process", id: "process" },
  { n: "05", label: "Contact", href: "#contact", id: "contact" },
] as const;
