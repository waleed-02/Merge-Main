# Merge & Main

Scroll-driven 3D site for Merge & Main, a product studio from India.
One story runs through the whole page: messy work "branches" get untangled and merged into one clean "main" line.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber + drei · GSAP ScrollTrigger · Lenis.

## Run it

Needs Node 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint
```

## Before you launch

Everything you are likely to change is in `lib/site.ts`:

| Field | What to put there |
| --- | --- |
| `whatsapp` | Your number, digits only with country code, e.g. `919876543210`. While this is empty the contact form sends by email instead. |
| `whatsappDisplay` | The number as shown on the page, e.g. `+91 98765 43210`. Currently the placeholder `[YOUR NUMBER]`. |
| `city` | Currently the placeholder `[YOUR CITY]`. |
| `url` | Your live domain, or set `NEXT_PUBLIC_SITE_URL` in the environment. Used for the canonical URL and the share image. |

**Logo.** The logo is drawn in code from one definition (`lib/mark.ts`) so the SVG, the 3D mark, the favicon and the share image all match. The wordmark is set in Plus Jakarta Sans. To use your original artwork in the dock and footer, put the files in `public/brand/` and return an `<Image>` from `components/ui/Logo.tsx`; that component is the only place the full logo is rendered.

## Deploy to Vercel

1. Push this folder to a GitHub, GitLab or Bitbucket repository.
2. In Vercel choose **Add New → Project** and import the repository. The framework is detected as Next.js; leave the build settings as they are.
3. Under **Environment Variables** add `NEXT_PUBLIC_SITE_URL` with your domain, e.g. `https://mergeandmain.com`.
4. Deploy, then add your domain under **Settings → Domains**.

Or from this folder with the CLI:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

## How it is put together

```
app/
  layout.tsx            fonts, SEO metadata
  page.tsx              the page: sections in order
  opengraph-image.tsx   share image, built from the logo mark
  icon.svg              favicon
  globals.css           the three colours, type, preloader + hero intro
components/
  sections/             one component per section (the HTML half)
  three/                one component per 3D scene, plus the shared canvas
  ui/                   logo, dock, cursor, spine, preloader
  providers/            Lenis + ScrollTrigger + pointer input
lib/
  scroll-store.ts       the single scroll store
  mark.ts               the logo mark's geometry
  gsap.ts               GSAP setup, the brand ease, media conditions
  site.ts               contact details and nav
```

**One canvas.** `components/three/Scene.tsx` is the only `<Canvas>`. It is fixed to the viewport and renders on demand: a frame is drawn when the page scrolls, the pointer moves, or a visible scene is animating. Scenes mount and unmount by section.

**3D pinned to the DOM.** 3D objects do not have their own layout. A section leaves an empty slot (`anchorRef("phone")`), and the scene reads that element's position every frame and stands the object in it. That is why the same phone works in the horizontal track on desktop and the vertical stack on mobile.

**Layering.** The canvas sits between a section's background and its content for the hero, Process and Contact, so text can be both behind and in front of the 3D. Those three sections must not create a stacking context (no `z-index`, `transform` or `opacity` on the `<section>` itself). For Scholarvale, Client work and Services the canvas moves above the page.

**The scroll store.** `lib/scroll-store.ts` has two halves: `useScrollStore` for values that change rarely (active section, mobile, reduced motion) and `scrollState` for per-frame values (section progress, pointer), which are plain fields so they never re-render React.

**Colour.** `globals.css` removes Tailwind's palette and defines only `orange`, `black` and `white`. Softer shades are opacity (`text-black/60`). There is one deliberate exception, documented in `components/three/shared.ts`: the thin lines on the black Process section are white-at-40% mixed ahead of time, because a truly transparent white would be bright enough to bloom.

## Motion and accessibility

- Scroll choreography is scrubbed with ScrollTrigger; pinning uses CSS `position: sticky`, so there are no pin spacers and no layout shift.
- `prefers-reduced-motion`: no smooth scroll, no pinning, no scrubbing. Each 3D scene shows its final state as a still and sections fade in. Note that Windows reports reduced motion when **Settings → Accessibility → Visual effects → Animation effects** is off, so turn it on to see the full version.
- Below 900px: fewer hero tubes, no shadows, no post-processing, no reflection probe; the Scholarvale track is a vertical stack.
- All text is HTML. The phone screen and the labels on the tubes are drei `<Html>`; the 3D never contains text.
- The preloader and hero intro are CSS, so they start at first paint. Repeat visits skip the preloader.

## Known gaps

- **Lighthouse mobile performance measured 67–70 locally, below the 85 target.** Accessibility, SEO and best practices are 100 and layout shift is 0. The local test ran in headless Chrome without a real GPU, which inflates the cost of starting WebGL, so test on a real mid-range Android phone (or PageSpeed Insights against the deployed URL) before treating either number as final.
- Ambient occlusion is not implemented; depth comes from soft shadows and studio reflections.
- Frame rate has not been measured on real hardware.
