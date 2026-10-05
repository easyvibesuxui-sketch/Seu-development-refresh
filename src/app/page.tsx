import Preloader from "@/components/layout/Preloader";
import HeroMap from "@/components/hero/HeroMap";
import AboutCompany from "@/components/home/AboutCompany";
import LightScene from "@/components/home/LightScene";
import ProjectsDeck from "@/components/home/ProjectsDeck";
import ChooseView from "@/components/home/ChooseView";
import Interior360 from "@/components/home/Interior360";
import Lifestyle from "@/components/home/Lifestyle";
import ScrollWords from "@/components/home/ScrollWords";
import Partners from "@/components/home/Partners";
import AboutSeu from "@/components/home/AboutSeu";
import ContactSection from "@/components/home/ContactSection";

/*
 * Home rhythm alternates tones so the page reads as one sequence: bright day map and story,
 * the dark light-scene and project deck, the bright finder, the inside view, the bright
 * lifestyle, dark partners, bright brand story, dark contact.
 */
export default function Home() {
  return (
    <>
      <Preloader />
      <main>
        <HeroMap />
        <AboutCompany />
        <LightScene />
        <ProjectsDeck />
        <ChooseView />
        <Interior360 />
        <Lifestyle />
        <ScrollWords />
        <Partners />
        <AboutSeu />
        <ContactSection />
      </main>
    </>
  );
}
