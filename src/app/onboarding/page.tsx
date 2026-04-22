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
      } catch (error: any) {
        const status = error?.response?.status;

        if (status === 401) {
          router.replace(RouteConfig.auth.signIn);
          return;
        }

        setReady(true);
      }
    };

    checkOnboardingAccess();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OnboardingLayout>
          <div className="text-center">Loading onboarding...</div>
        </OnboardingLayout>
      </div>
    );
  }

  return (
    <OnboardingLayout>
      <ChurchOnboarding />
    </OnboardingLayout>
  );
}
