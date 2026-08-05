import { generateSeoMetadata } from "@/lib/seo";
import Header from "@/components/features/landing/layout/header";
import Footer from "@/components/features/landing/layout/footer";
import PageIntro from "@/components/features/landing/home/PageIntro";
import PricingSection from "@/components/features/landing/home/PricingSection";
import CtaSection from "@/components/features/landing/home/CtaSection";

export const metadata = generateSeoMetadata({
  title: "Pricing | Church Management Software",
  description:
    "Simple, transparent pricing for Church Workflow's church administration software. Start free, or upgrade for church accounting, multi-branch, and advanced ministry management tools.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <main className="bg-white overflow-x-hidden">
      <Header />
      <PageIntro
        title="Church Management Software Pricing"
        description="Church Workflow is priced for churches of every size — from a free starter plan for small congregations to multi-branch plans for large ministries, with Naira pricing built for Nigerian churches."
      />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
