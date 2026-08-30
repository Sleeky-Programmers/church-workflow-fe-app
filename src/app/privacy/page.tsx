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
  title: "Privacy Policy | Church Workflow",
  description: "How Church Workflow collects, uses, and protects your data.",
  path: "/privacy",
  noIndex: true,
});

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "Information We Collect",
    body: [
      "Account information you provide when you sign up, such as your name, email address, phone number, and church details.",
      "Member and operational data you or your team enter into Church Workflow, such as membership records, attendance, and department/team information.",
      "Usage data collected automatically, such as pages visited and features used, via analytics tools (Google Analytics, Mixpanel).",
      "Payment information processed by our payment providers (Paystack, Flutterwave) — we do not store your card details ourselves.",
    ],
  },
  {
    heading: "How We Use Information",
    body: [
      "To provide, maintain, and improve the Church Workflow service.",
      "To communicate with you about your account, updates, and support requests.",
      "To process payments and manage subscriptions.",
      "To understand product usage and improve the product experience.",
    ],
  },
  {
    heading: "Data Sharing",
    body: [
      "We do not sell your personal data.",
      "We share data with service providers who help us operate the platform (e.g. hosting, email delivery, payment processing, analytics), under agreements that require them to protect your data.",
      "We may disclose information if required by law.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We retain account and member data for as long as your account is active, and for a reasonable period afterward as required for legal, accounting, or legitimate business purposes.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data by contacting us.",
      "You may opt out of non-essential analytics tracking where technically supported.",
    ],
  },
  {
    heading: "Changes to This Policy",
    body: [
      "We may update this policy from time to time. Material changes will be communicated to registered users.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about this policy can be directed to our support team through the contact channels listed on our website.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white overflow-x-hidden">
      <Header />

      <section className="max-w-3xl mx-auto px-6 pt-32 pb-20 md:pt-40">
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <Text className="text-sm text-amber-900 font-medium">
            Draft — this page is a placeholder and has not yet been reviewed by
            legal counsel. It is not a finished or binding policy.
          </Text>
        </div>

        <Heading level={1} className="text-3xl md:text-4xl font-black mb-2">
          Privacy Policy
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
