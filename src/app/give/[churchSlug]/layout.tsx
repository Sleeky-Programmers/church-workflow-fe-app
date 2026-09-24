import { generateSeoMetadata } from "@/lib/seo";

export const metadata = generateSeoMetadata({
  title: "Give Online",
  description: "Give online securely to your church.",
  path: "/give",
  noIndex: true,
});

export default function GiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
