import { redirect } from "next/navigation";

// Membership is now a module with sub-pages; the Dashboard sub-page is the
// module's landing view. Keep the old URL working via redirect.
export default function MembershipIndexPage() {
  redirect("/dashboard/membership/dashboard");
}
