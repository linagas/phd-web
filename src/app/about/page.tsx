import AboutHero from "./components/about-hero";
import AboutManifesto from "./components/about-manifesto";
import WhyChooseUs from "./components/why-choose-us";
import AboutFocus from "./components/about-focus";
import Contact from "@/app/components/contact/page";

export default function AboutPage() {
  return (
    <section className="min-h-screen mt-14 flex justify-center">
      <div className="max-w-screen-2xl w-full pt-8">
        <div className="relative h-full">
          <div className="relative flex flex-col items-center h-full">
            <AboutHero />

            <AboutManifesto />

            <WhyChooseUs />

            <div className="w-full px-4 md:px-16">
              <AboutFocus />
            </div>

            <article id="section-contact" className="w-full px-4 md:px-8 mt-8">
              <Contact />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}