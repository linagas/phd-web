import HeroSection from "./components/hero-section";
import RoiCalculator from "@/app/components/roi-calculator";
import PhdDifference from "@/app/components/phd-difference";
import ServicesGrid from "@/app/components/services-grid";
import AqiTool from "@/app/components/aqi-tool";
import RoadmapSection from "@/app/components/roadmap-section";
import BookingSection from "@/app/components/booking-section";

export default function Home() {
  return (
    <main className="bg-phd-dark">
      <HeroSection />
      <RoiCalculator />
      <PhdDifference />
      <ServicesGrid />
      <AqiTool />
      <RoadmapSection />
      <BookingSection />
    </main>
  );
}
