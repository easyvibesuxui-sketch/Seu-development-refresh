import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/** Every page of the website proper: header, content, footer. The entrance gate at / sits outside. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <Footer />
    </>
  );
}
