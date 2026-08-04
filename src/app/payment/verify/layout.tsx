import { generateSeoMetadata } from "@/lib/seo";

export const metadata = generateSeoMetadata({
  title: "Payment Verification",
  description: "Verifying your Church Workflow payment.",
  path: "/payment/verify",
  noIndex: true,
});

export default function PaymentVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
