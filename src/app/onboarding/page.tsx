"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/features/landing/layout/onboarding-layout";
import ChurchOnboarding from "@/components/features/onboarding";
import { RouteConfig } from "@/config/routes";
import {
  getAccessToken,
  shouldCurrentUserCompleteOnboarding,
} from "@/lib/auth/session";

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace(RouteConfig.auth.signIn);
      return;
    }

    if (!shouldCurrentUserCompleteOnboarding()) {
      router.replace(RouteConfig.dashboard.home);
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <OnboardingLayout>
      <ChurchOnboarding />
    </OnboardingLayout>
  );
}
