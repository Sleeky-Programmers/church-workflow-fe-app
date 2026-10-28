import { generateSeoMetadata } from "@/lib/seo";
import Header from "@/components/features/landing/layout/header";
import Footer from "@/components/features/landing/layout/footer";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { termsSections } from "@/lib/legal-content";

// DRAFT PAGE - generic placeholder structure only. Do not treat as a
// finished legal document: it has not been reviewed by counsel and must be
// replaced with real, reviewed content before this is unindexed (see
// `noIndex` below) or relied upon for compliance purposes.
export const metadata = generateSeoMetadata({
  title: "Terms of Service | Church Workflow",
  description: "The terms that govern your use of Church Workflow.",
  path: "/terms",
  noIndex: true,
});

const sections = termsSections;

export default function TermsOfServicePage() {
  return (
    <main className="bg-white overflow-x-hidden">
      <Header />

      <section className="max-w-3xl mx-auto px-6 pt-32 pb-20 md:pt-40">
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <Text className="text-sm text-amber-900 font-medium">
            Draft - this page is a placeholder and has not yet been reviewed by
            legal counsel. It is not a finished or binding agreement.
          </Text>
        </div>

        <Heading level={1} className="text-3xl md:text-4xl font-black mb-2">
          Terms of Service
        </Heading>
        <Text variant="muted" className="mb-10 text-sm">
          Last updated: placeholder - update this date once finalized.
        </Text>

        <div className="space-y-8">
          {sections.map((section) => (
            <article key={section.heading}>
              <Heading level={2} className="text-xl font-bold mb-3">
                {section.heading}
              </Heading>
              <div className="space-y-2">
                {section.body.map((paragraph) => (
                  <Text
                    key={paragraph}
                    variant="muted"
                    className="text-sm leading-relaxed"
                  >
                    {paragraph}
                  </Text>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
