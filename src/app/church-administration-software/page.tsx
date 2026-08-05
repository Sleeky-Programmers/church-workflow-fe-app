import { generateSeoMetadata } from "@/lib/seo";
import KeywordLandingTemplate from "@/components/features/landing/home/KeywordLandingTemplate";

export const metadata = generateSeoMetadata({
  title: "Church Administration Software | Church Workflow",
  description:
    "Church Workflow is church administration software and a church administration platform for managing departments, teams, tasks, and church operations management from one dashboard.",
  path: "/church-administration-software",
});

export default function ChurchAdministrationSoftwarePage() {
  return (
    <KeywordLandingTemplate
      title="Church Administration Software That Simplifies Operations"
      description="Church Workflow is a church administration platform built as a church operations management tool — coordinating departments, teams, tasks, and volunteers so your admin team spends less time chasing paperwork and more time supporting ministry."
    />
  );
}
