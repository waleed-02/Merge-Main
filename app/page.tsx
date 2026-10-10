import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { SceneMount } from "@/components/three/SceneMount";
import { Cursor } from "@/components/ui/Cursor";
import { Dock } from "@/components/ui/Dock";
import { Preloader } from "@/components/ui/Preloader";
import { Spine } from "@/components/ui/Spine";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Scholarvale } from "@/components/sections/Scholarvale";
import { ClientWork } from "@/components/sections/ClientWork";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { StackMarquee } from "@/components/sections/StackMarquee";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />
      {/* One shared canvas, fixed behind (or, for some sections, above) the page */}
      <SceneMount />
      <main>
        <Hero />
        <Manifesto />
        <Scholarvale />
        <ClientWork />
        <Services />
        <Process />
        <StackMarquee />
        <Contact />
      </main>
      <Footer />
      <Spine />
      <Dock />
      <Cursor />
    </SmoothScroll>
  );
}
