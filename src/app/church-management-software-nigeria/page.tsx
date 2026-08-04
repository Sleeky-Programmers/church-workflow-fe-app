import { generateSeoMetadata } from "@/lib/seo";
import KeywordLandingTemplate from "@/components/features/landing/home/KeywordLandingTemplate";

export const metadata = generateSeoMetadata({
  title: "Church Management Software in Nigeria | Church Workflow",
  description:
    "Church Workflow is church management software Nigeria churches trust — with Naira pricing, local support, church accounting software, and ministry management software for multi-branch churches.",
  path: "/church-management-software-nigeria",
});

export default function ChurchManagementSoftwareNigeriaPage() {
  return (
    <KeywordLandingTemplate
      title="Church Management Software Built for Nigerian Churches"
      description="Church Workflow is ministry management software designed for the Nigerian church context — with Naira pricing, local support, church volunteer management software, and church accounting software for churches with one branch or many."
    />
  );
}
