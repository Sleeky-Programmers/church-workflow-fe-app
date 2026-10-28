import { generateSeoMetadata } from "@/lib/seo";
import KeywordLandingTemplate from "@/components/features/landing/home/KeywordLandingTemplate";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

export const metadata = generateSeoMetadata({
  title: "Church Management Software in Nigeria | Church Workflow",
  description:
    "Church Workflow is church management software Nigeria churches trust - with Naira pricing, local support, church accounting software, and ministry management software for multi-branch churches.",
  path: "/church-management-software-nigeria",
});

// See src/app/page.tsx for why this is revalidated rather than left fully
// static - this page's plan prices come from the same server fetch.
export const revalidate = 3600;

export default function ChurchManagementSoftwareNigeriaPage() {
  return (
    <KeywordLandingTemplate
      title="Church Management Software Built for Nigerian Churches"
      description="Church Workflow is ministry management software designed for the Nigerian church context - with Naira pricing, local support, church volunteer management software, and church accounting software for churches with one branch or many."
    >
      <section className="max-w-3xl mx-auto px-6 py-16">
        <Heading level={2} className="text-2xl md:text-3xl font-black mb-4">
          Made for How Nigerian Churches Actually Run
        </Heading>
        <div className="space-y-4">
          <Text variant="muted" className="leading-relaxed">
            Most church management software is built for a North American or
            European context and simply doesn't fit how Nigerian churches are
            structured or how members expect to pay for things. Church Workflow
            starts from the Nigerian church - cell groups, fellowships, and
            units that function as small, self-contained teams inside a larger
            congregation - and builds the software around that, not the other
            way round.
          </Text>
          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            Naira Pricing, Paid the Way You Actually Pay
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            Every plan is priced in Naira, not converted from a dollar price at
            checkout. Subscriptions are processed through Paystack, which means
            payment isn't limited to a card - bank transfer and USSD are
            supported too, so a church treasurer doesn't need a debit card on
            hand to keep the subscription active.
          </Text>
          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            Cell Groups and Fellowships, Not Just "Departments"
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            Church Workflow's Small Teams feature maps directly onto how
            Nigerian churches already organize themselves - a cell group, a
            fellowship, a young adults' unit, or a single department of a larger
            church - each with its own leader, members, and attendance record,
            without forcing your structure into a rigid "branch" or "campus"
            model that doesn't match how you actually operate.
          </Text>
          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            Support You Can Actually Reach
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            Questions and issues go to a real Nigerian phone number and WhatsApp
            line, not a support ticket queue in a different time zone - see our{" "}
            <a href="/contact" className="text-[#0C5FB3] underline">
              contact page
            </a>{" "}
            for details.
          </Text>
        </div>
      </section>
    </KeywordLandingTemplate>
  );
}
