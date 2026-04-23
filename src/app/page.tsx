import HeroSection from "@/components/features/landing/home/hero";
import ChallengesSection from "@/components/features/landing/home/ChallengesSection";
import SmarterWaySection from "@/components/features/landing/home/SmarterWaySection";
import HowItWorksSection from "@/components/features/landing/home/HowItWorksSection";
import FocusMinistrySection from "@/components/features/landing/home/FocusMinistrySection";
import BuiltForChurchSection from "@/components/features/landing/home/BuiltForChurchSection";
import PricingSection from "@/components/features/landing/home/PricingSection";
import CtaSection from "@/components/features/landing/home/CtaSection";
import Footer from "@/components/features/landing/layout/footer";
import Header from "@/components/features/landing/layout/header";

export default function Home() {
  return (
    <main className="bg-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <ChallengesSection />
      <SmarterWaySection />
      <HowItWorksSection />
      <FocusMinistrySection />
      <BuiltForChurchSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
