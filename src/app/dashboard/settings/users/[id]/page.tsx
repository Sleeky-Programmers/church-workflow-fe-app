import { UserDetailsPageClient } from "@/components/features/dashboard/admin/user-client-detail";
import { fetchUserById } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function UserDetailsRoute({
  params,
}: {
  params: { id: string };
}) {
  try {
    const { id } = await params;
    const user = await fetchUserById(id);

    if (!user) {
      notFound();
    }

    return <UserDetailsPageClient user={user} />;
  } catch (error) {
    console.error("Error fetching user:", error);
    notFound();
  }
}
