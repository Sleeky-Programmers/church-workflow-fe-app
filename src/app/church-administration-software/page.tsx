import { generateSeoMetadata } from "@/lib/seo";
import KeywordLandingTemplate from "@/components/features/landing/home/KeywordLandingTemplate";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

export const metadata = generateSeoMetadata({
  title: "Church Administration Software | Church Workflow",
  description:
    "Church Workflow is church administration software and a church administration platform for managing departments, teams, tasks, and church operations management from one dashboard.",
  path: "/church-administration-software",
});

// See src/app/page.tsx for why this is revalidated rather than left fully
// static — this page's plan prices come from the same server fetch.
export const revalidate = 3600;

export default function ChurchAdministrationSoftwarePage() {
  return (
    <KeywordLandingTemplate
      title="Church Administration Software That Simplifies Operations"
      description="Church Workflow is a church administration platform built as a church operations management tool — coordinating departments, teams, tasks, and volunteers so your admin team spends less time chasing paperwork and more time supporting ministry."
    >
      <section className="max-w-3xl mx-auto px-6 py-16">
        <Heading level={2} className="text-2xl md:text-3xl font-black mb-4">
          Built for the Person Who Actually Runs the Church Office
        </Heading>
        <div className="space-y-4">
          <Text variant="muted" className="leading-relaxed">
            Every church has someone — an administrator, a pastor's assistant, a
            department head — who ends up owning the day-to-day admin workload
            almost by default: updating member details, chasing department heads
            for attendance numbers, onboarding new volunteers, and answering
            "who has access to what" questions nobody wrote down anywhere.
            Church Workflow is built around that role, not around the org chart.
          </Text>
          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            Roles and Permissions That Match How Your Church Is Actually Run
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            Instead of giving every admin the same blanket access — or sharing
            one login between three people — Church Workflow lets you create
            custom roles with specific permissions. A department head can manage
            their own team's members and attendance without being able to touch
            billing or church-wide settings. A front-desk volunteer can check
            members in without seeing financial or administrative pages at all.
            Access follows the actual responsibility, not a guess.
          </Text>
          <Heading level={3} className="text-lg font-bold mt-6 mb-2">
            An Activity Log, So Nothing Gets Lost to "I Thought Someone Else Did
            That"
          </Heading>
          <Text variant="muted" className="leading-relaxed">
            Church administration usually involves more than one hand touching
            the same records — a member's details updated by one volunteer,
            their team assignment changed by another, an invite sent by a third.
            Church Workflow's activity log keeps a running record of who changed
            what and when, across members, teams, departments, and roles, so an
            administrator can answer "what happened here" without relying on
            memory or a group-chat search.
          </Text>
          <Text variant="muted" className="leading-relaxed">
            The result is fewer dropped handoffs, less duplicated work between
            departments, and an admin team that spends its time on the church's
            actual operations instead of untangling who was supposed to do what.
          </Text>
        </div>
      </section>
    </KeywordLandingTemplate>
  );
}
