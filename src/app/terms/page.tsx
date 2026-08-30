import { generateSeoMetadata } from "@/lib/seo";
import Header from "@/components/features/landing/layout/header";
import Footer from "@/components/features/landing/layout/footer";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

// DRAFT PAGE — generic placeholder structure only. Do not treat as a
// finished legal document: it has not been reviewed by counsel and must be
// replaced with real, reviewed content before this is unindexed (see
// `noIndex` below) or relied upon for compliance purposes.
export const metadata = generateSeoMetadata({
  title: "Terms of Service | Church Workflow",
  description: "The terms that govern your use of Church Workflow.",
  path: "/terms",
  noIndex: true,
});

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "Acceptance of Terms",
    body: [
      "By creating an account or using Church Workflow, you agree to these Terms of Service. If you do not agree, do not use the service.",
    ],
  },
  {
    heading: "Description of Service",
    body: [
      "Church Workflow is a church management platform providing membership management, attendance tracking, team/department administration, and related tools, offered on free and paid subscription plans.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
      "You must provide accurate information when creating an account and keep it up to date.",
    ],
  },
  {
    heading: "Subscriptions and Billing",
    body: [
      "Paid plans are billed on the cycle you select (monthly or yearly) at the price displayed at checkout.",
      "Payments are processed by third-party providers (Paystack, Flutterwave). By subscribing, you authorize us to charge your chosen payment method on a recurring basis until you cancel.",
      "Fees are non-refundable except where required by law or explicitly stated otherwise.",
    ],
  },
  {
    heading: "Free Plan Limits",
    body: [
      "The free Starter plan is subject to usage limits (such as member and user counts) as described on our pricing page. Exceeding these limits may require upgrading to a paid plan to continue full functionality.",
    ],
  },
  {
    heading: "Acceptable Use",
    body: [
      "You agree not to use Church Workflow for unlawful purposes, to upload data you do not have the right to store, or to attempt to disrupt or compromise the service.",
    ],
  },
  {
    heading: "Termination",
    body: [
      "You may cancel your account at any time. We may suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    heading: "Limitation of Liability",
    body: [
      'Church Workflow is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the service.',
    ],
  },
  {
    heading: "Changes to These Terms",
    body: [
      "We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the updated terms.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these terms can be directed to our support team through the contact channels listed on our website.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="bg-white overflow-x-hidden">
      <Header />

      <section className="max-w-3xl mx-auto px-6 pt-32 pb-20 md:pt-40">
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <Text className="text-sm text-amber-900 font-medium">
            Draft — this page is a placeholder and has not yet been reviewed by
            legal counsel. It is not a finished or binding agreement.
          </Text>
        </div>

        <Heading level={1} className="text-3xl md:text-4xl font-black mb-2">
          Terms of Service
        </Heading>
        <Text variant="muted" className="mb-10 text-sm">
          Last updated: placeholder — update this date once finalized.
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
