import Contact from "@/app/components/contact/page";
import HeroSection from "./components/hero-section";
import RoiCalculator from "@/app/components/roi-calculator";
import PhdDifference from "@/app/components/phd-difference";
import ServicesGrid from "@/app/components/services-grid";
import AqiTool from "@/app/components/aqi-tool";
import RoadmapSection from "@/app/components/roadmap-section";

export default function Home() {
  return (
    <main className="bg-phd-dark">
      <HeroSection />
      <RoiCalculator />
      <PhdDifference />
      <ServicesGrid />
      <AqiTool />
      <RoadmapSection />
      <article
        id="section-contact"
        className="flex flex-col items-center p-4 md:p-8"
      >
        <Contact />
      </article>
    </main>
  );
}
