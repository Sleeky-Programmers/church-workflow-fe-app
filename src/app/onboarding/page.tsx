"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/features/landing/layout/onboarding-layout";
import ChurchOnboarding from "@/components/features/onboarding";
import { RouteConfig } from "@/config/routes";
import { getAccessToken } from "@/lib/auth/session";
import { getMyChurch } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkOnboardingAccess = async () => {
      const token = getAccessToken();

      if (!token) {
        router.replace(RouteConfig.auth.signIn);
        return;
      }

      try {
        const church = await getMyChurch();
        if (church) {
          router.replace(RouteConfig.dashboard.home);
          return;
        }
        setReady(true);
      } catch {
        router.replace(RouteConfig.auth.signIn);
      }
    };

    checkOnboardingAccess();
  }, [router]);

  if (!ready) return null;

  return (
    <OnboardingLayout>
      <ChurchOnboarding />
    </OnboardingLayout>
  );
}
