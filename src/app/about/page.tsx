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
          {/* Fondo decorativo curva fucsia */}
          <div
            className="absolute inset-0 bg-cover bg-center mt-[620px] h-[920px]"
            style={{
              backgroundImage: `url("/assets/curva-fucsia.svg")`,
              zIndex: -1,
            }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-center h-full">
            <AboutHero />

            <AboutManifesto />

            <WhyChooseUs />

            <div className="w-full px-4 md:px-16">
              <AboutFocus />
            </div>

            <article id="section-contact" className="w-full px-4 md:px-8">
              <Contact />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
