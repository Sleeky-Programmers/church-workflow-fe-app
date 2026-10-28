import { generateSeoMetadata } from "@/lib/seo";
import KeywordLandingTemplate from "@/components/features/landing/home/KeywordLandingTemplate";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Check } from "lucide-react";

export const metadata = generateSeoMetadata({
  title: "Free Church Management Software | Church Workflow",
  description:
    "Church Workflow's Starter plan is free church management software for small churches, cell groups, and house churches - permanently free for up to 100 members and 3 users, no card required.",
  path: "/free-church-management-software",
});

// See src/app/page.tsx for why this is revalidated rather than left fully
// static - this page's plan prices come from the same server fetch.
export const revalidate = 3600;

const INCLUDED_FEATURES = [
  "Membership management",
  "Attendance tracking",
  "Small Teams (cell groups, fellowships, units)",
  "Up to 3 users",
  "Up to 100 members",
];

export default function FreeChurchManagementSoftwarePage() {
  return (
    <KeywordLandingTemplate
      title="Free Church Management Software for Small Churches"
      description="Church Workflow's Starter plan is real church management software, free permanently - built for cell groups, house churches, church plants, and any congregation of up to 100 members. Start free, no card required."
    >
      <section className="max-w-3xl mx-auto px-6 py-16">
        <Heading level={2} className="text-2xl md:text-3xl font-black mb-4">
          What's Actually Free
        </Heading>
        <div className="space-y-4">
          <Text variant="muted" className="leading-relaxed">
            A cell group, a house church, a church plant, or a single department
            of a larger church doesn't need - or want to pay for - enterprise
            church software. Church Workflow's Starter plan is a genuinely free
            church attendance tracker and member management system, not a 14-day
            trial that quietly starts charging you. There's no card required to
            start, and no expiry date on the free tier itself.
          </Text>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-3">
            {INCLUDED_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                <Text className="text-sm">{feature}</Text>
              </div>
            ))}
          </div>

          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            Where the Limit Actually Is
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            The Starter plan covers up to 100 members and 3 users - plenty for a
            cell group management app, a house church, or a church planting team
            getting started. We say this plainly because a "free plan" that
            hides its real limits until you hit a wall isn't actually free, it's
            a trap. Church Workflow shows a warning inside your dashboard as you
            approach 100 members, well before you're blocked from adding more -
            no surprises.
          </Text>

          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            What Happens When You Outgrow It
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            When your congregation grows past 100 members or you need more than
            3 users, you upgrade to a paid plan - your existing member records,
            attendance history, and teams carry over with nothing to re-enter or
            migrate. Growing past the free tier is a sign things are going well,
            and Church Workflow is built to grow with you rather than forcing a
            switch to different software later.
          </Text>
        </div>
      </section>
    </KeywordLandingTemplate>
  );
}
