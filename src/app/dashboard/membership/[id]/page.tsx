"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMemberById } from "@/services/memberService";
import { MemberProfile } from "@/types";
import { Loader } from "@/components/ui/loader";
import { MemberDetailsPage } from "@/components/features/dashboard/membership/member-details-page";

export default function MemberDetailsRoutePage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await fetchMemberById(id);
        setMember(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (!member) {
    return <div className="p-6">Member not found</div>;
  }

  return (
    <MemberDetailsPage
      member={member}
      onBack={() => router.push("/dashboard/membership")}
    />
  );
}
