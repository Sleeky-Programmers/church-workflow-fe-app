import { generateSeoMetadata } from "@/lib/seo";
import Header from "@/components/features/landing/layout/header";
import Footer from "@/components/features/landing/layout/footer";
import PageIntro from "@/components/features/landing/home/PageIntro";
import FocusMinistrySection from "@/components/features/landing/home/FocusMinistrySection";
import BuiltForChurchSection from "@/components/features/landing/home/BuiltForChurchSection";
import HowItWorksSection from "@/components/features/landing/home/HowItWorksSection";
import SmarterWaySection from "@/components/features/landing/home/SmarterWaySection";
import CtaSection from "@/components/features/landing/home/CtaSection";

export const metadata = generateSeoMetadata({
  title: "Features | Church Management Software",
  description:
    "Explore Church Workflow's church management software features: member management, attendance tracking, church communication software, finance, and volunteer management tools built for ministry operations.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <main className="bg-white overflow-x-hidden">
      <Header />
      <PageIntro
        title="Everything Your Church Management Software Needs"
        description="Church Workflow brings church member management, church communication software, attendance, and ministry operations together in one church administration platform — so your team spends less time on admin and more time on ministry."
      />
      <FocusMinistrySection />
      <BuiltForChurchSection />
      <HowItWorksSection />
      <SmarterWaySection />
      <CtaSection />
      <Footer />
    </main>
  );
}
