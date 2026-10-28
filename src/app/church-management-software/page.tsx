import { generateSeoMetadata } from "@/lib/seo";
import KeywordLandingTemplate from "@/components/features/landing/home/KeywordLandingTemplate";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

export const metadata = generateSeoMetadata({
  title: "Church Management Software | Church Workflow",
  description:
    "Church Workflow is church management software that unifies member management, attendance, communication, and finance in one church workflow system built for growing ministries.",
  path: "/church-management-software",
});

// See src/app/page.tsx for why this is revalidated rather than left fully
// static - this page's plan prices come from the same server fetch.
export const revalidate = 3600;

export default function ChurchManagementSoftwarePage() {
  return (
    <KeywordLandingTemplate
      title="Church Management Software for Growing Ministries"
      description="Church Workflow is church management software that gives your team a single church member management system for records, attendance, communication, and finance - replacing spreadsheets and scattered tools with one church workflow system."
    >
      <section className="max-w-3xl mx-auto px-6 py-16">
        <Heading level={2} className="text-2xl md:text-3xl font-black mb-4">
          What Is Church Management Software?
        </Heading>
        <div className="space-y-4">
          <Text variant="muted" className="leading-relaxed">
            Church management software (often shortened to ChMS) is a
            purpose-built system for running the operational side of a church -
            keeping member records accurate, tracking who attended which
            service, organizing volunteers and departments into teams, and
            giving leadership a single, current picture of the congregation
            instead of a patchwork of spreadsheets, paper registers, and group
            chats.
          </Text>
          <Text variant="muted" className="leading-relaxed">
            Most churches start with what's free and familiar - a shared
            spreadsheet, a notebook at the welcome desk, a WhatsApp group for
            each unit. That works until the church grows past a handful of
            families. Past that point, records go stale, the same member gets
            entered twice under two different spellings, nobody can say with
            confidence how many people actually attend on a given Sunday, and
            follow-up on first-time visitors quietly stops happening because no
            one owns it.
          </Text>
          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            What to Look for in a ChMS
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            The features worth prioritizing are the ones that remove friction
            from a real Sunday, not the ones that look impressive in a demo: a
            member database that's fast to search and easy to keep clean,
            attendance tracking that takes seconds per service rather than
            minutes, role-based access so volunteers only see what's relevant to
            their team, and a record of who changed what and when - so
            leadership isn't left guessing when something looks off.
          </Text>
          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            Why Accountability Matters
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            Church administration runs on trust between leadership, department
            heads, and the congregation - which is exactly why an auditable
            trail of who did what matters more here than in a typical business
            tool. Church Workflow's role-based permissions and activity log
            exist for that reason: a pastor or admin can see what changed in the
            member database, who added a new team lead, or who updated a service
            record, without having to ask around or take anyone's word for it.
          </Text>
        </div>
      </section>
    </KeywordLandingTemplate>
  );
}
