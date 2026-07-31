"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { OnboardingLayout } from "@/components/features/landing/layout/onboarding-layout";
import ChurchOnboarding from "@/components/features/onboarding";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { RouteConfig } from "@/config/routes";
import { getMyChurch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/session";

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
          <div className="flex items-center justify-center min-h-[320px] gap-3">
            <Loader size="w-12 h-12" />
            <Text variant="default">Loading onboarding...</Text>
          </div>
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
