import Header from "@/components/features/landing/layout/header";
import Footer from "@/components/features/landing/layout/footer";
import PageIntro from "@/components/features/landing/home/PageIntro";
import ChallengesSection from "@/components/features/landing/home/ChallengesSection";
import HowItWorksSection from "@/components/features/landing/home/HowItWorksSection";
import FocusMinistrySection from "@/components/features/landing/home/FocusMinistrySection";
import BuiltForChurchSection from "@/components/features/landing/home/BuiltForChurchSection";
import PricingSection from "@/components/features/landing/home/PricingSection";
import CtaSection from "@/components/features/landing/home/CtaSection";
import FaqSection from "@/components/features/landing/home/FaqSection";
import { FaqJsonLd } from "@/components/seo/JsonLd";

interface KeywordLandingTemplateProps {
  title: string;
  description: string;
  /** Page-specific body copy rendered between the intro and the shared
   * sections below — this is what keeps each keyword page's content
   * genuinely distinct instead of just swapping the H1. */
  children?: React.ReactNode;
}

export default function KeywordLandingTemplate({
  title,
  description,
  children,
}: KeywordLandingTemplateProps) {
  return (
    <main className="bg-white overflow-x-hidden">
      <FaqJsonLd />
      <Header />
      <PageIntro title={title} description={description} />
      {children}
      <ChallengesSection />
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
