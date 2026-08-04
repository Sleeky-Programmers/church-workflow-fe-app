import { generateSeoMetadata } from "@/lib/seo";
import HeroSection from "@/components/features/landing/home/hero";
import ChallengesSection from "@/components/features/landing/home/ChallengesSection";
import SmarterWaySection from "@/components/features/landing/home/SmarterWaySection";
import HowItWorksSection from "@/components/features/landing/home/HowItWorksSection";
import FocusMinistrySection from "@/components/features/landing/home/FocusMinistrySection";
import BuiltForChurchSection from "@/components/features/landing/home/BuiltForChurchSection";
import PricingSection from "@/components/features/landing/home/PricingSection";
import CtaSection from "@/components/features/landing/home/CtaSection";
import FaqSection from "@/components/features/landing/home/FaqSection";
import Footer from "@/components/features/landing/layout/footer";
import Header from "@/components/features/landing/layout/header";

export const metadata = generateSeoMetadata({
  title: "Church Management Software in Nigeria | Church Workflow",
  description:
    "Church Workflow is an all-in-one church administration platform. Manage members, attendance, finance, and ministry operations with ease.",
  path: "/",
});

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
      <FaqSection />
      <Footer />
    </main>
  );
}
