import { ReactNode } from "react";

type OnboardingLayoutProps = {
  children: ReactNode;
};

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url(/assets/onboarding-bg.webp)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
