import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroMap from "@/components/hero/HeroMap";
import AboutCompany from "@/components/home/AboutCompany";
import ProjectsSections from "@/components/home/ProjectsSections";
import Partners from "@/components/home/Partners";
import AboutSeu from "@/components/home/AboutSeu";
import ContactSection from "@/components/home/ContactSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroMap />
        <AboutCompany />
        <ProjectsSections />
        <Partners />
        <AboutSeu />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
