"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { SignupPageContent } from "./signup-page-content";
import AuthLayout from "@/components/features/landing/auth/signup/auth-layout";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";

export default function SignupPage() {
  const router = useRouter();

  return (
    <Suspense
      fallback={
        <AuthLayout variant="signup" onBack={() => router.push("/")}>
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader />
            <Text variant="muted">Loading...</Text>
          </div>
        </AuthLayout>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
