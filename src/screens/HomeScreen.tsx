import Preloader from "@/components/layout/Preloader";
import HeroMap from "@/components/hero/HeroMap";
import AboutCompany from "@/components/home/AboutCompany";
import LightScene from "@/components/home/LightScene";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import ChooseView from "@/components/home/ChooseView";
import Interior360 from "@/components/home/Interior360";
import Lifestyle from "@/components/home/Lifestyle";
import LifeBarrel from "@/components/home/LifeBarrel";
import ScrollWords from "@/components/home/ScrollWords";
import Partners from "@/components/home/Partners";
import AboutSeu from "@/components/home/AboutSeu";
import ContactSection from "@/components/home/ContactSection";

/*
 * Home rhythm alternates tones so the page reads as one sequence: bright day map and story,
 * the dark light-scene and project strip, the bright finder, the inside view, the bright
 * lifestyle and the day-in-the-courtyard barrel, dark partners, bright brand story, dark contact.
 */
export default function HomeScreen() {
  return (
    <>
      <Preloader />
      <main>
        <HeroMap />
        <AboutCompany />
        <LightScene />
        <ProjectsShowcase />
        <ChooseView />
        <Interior360 />
        <Lifestyle />
        <LifeBarrel />
        <ScrollWords />
        <Partners />
        <AboutSeu />
        <ContactSection />
      </main>
    </>
  );
}
