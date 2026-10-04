import Preloader from "@/components/layout/Preloader";
import HeroMap from "@/components/hero/HeroMap";
import AboutCompany from "@/components/home/AboutCompany";
import ProjectsSections from "@/components/home/ProjectsSections";
import Partners from "@/components/home/Partners";
import ChooseView from "@/components/home/ChooseView";
import Lifestyle from "@/components/home/Lifestyle";
import AboutSeu from "@/components/home/AboutSeu";
import ContactSection from "@/components/home/ContactSection";
import LightScene from "@/components/home/LightScene";
import ScrollWords from "@/components/home/ScrollWords";

export default function Home() {
  return (
    <>
      <Preloader />
      <main>
        <HeroMap />
        <AboutCompany />
        <LightScene />
        <ProjectsSections />
        <ScrollWords />
        <ChooseView />
        <Lifestyle />
        <Partners />
        <AboutSeu />
        <ContactSection />
      </main>
    </>
  );
}
