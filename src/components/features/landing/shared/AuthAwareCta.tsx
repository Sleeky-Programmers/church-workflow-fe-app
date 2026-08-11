"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

interface AuthAwareCtaProps extends Pick<
  ButtonProps,
  "variant" | "size" | "className"
> {
  signedOutLabel?: string;
  signedInLabel?: string;
}

/**
 * Landing-page CTA that swaps to "Go to Dashboard" once the user is already
 * logged in, instead of pushing them back through /auth/signup.
 */
export function AuthAwareCta({
  variant = "default",
  size = "lg",
  className,
  signedOutLabel = "Sign Up",
  signedInLabel = "Go to Dashboard",
}: AuthAwareCtaProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"}>
      <Button variant={variant} size={size} className={className}>
        {isAuthenticated ? signedInLabel : signedOutLabel}
      </Button>
    </Link>
  );
}
