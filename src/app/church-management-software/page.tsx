import { generateSeoMetadata } from "@/lib/seo";
import KeywordLandingTemplate from "@/components/features/landing/home/KeywordLandingTemplate";

export const metadata = generateSeoMetadata({
  title: "Church Management Software | Church Workflow",
  description:
    "Church Workflow is church management software that unifies member management, attendance, communication, and finance in one church workflow system built for growing ministries.",
  path: "/church-management-software",
});

export default function ChurchManagementSoftwarePage() {
  return (
    <KeywordLandingTemplate
      title="Church Management Software for Growing Ministries"
      description="Church Workflow is church management software that gives your team a single church member management system for records, attendance, communication, and finance — replacing spreadsheets and scattered tools with one church workflow system."
    />
  );
}
