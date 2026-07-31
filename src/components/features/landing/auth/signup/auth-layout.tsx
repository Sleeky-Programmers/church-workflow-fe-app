import { AUTH_CONTENT, AuthVariant } from "@/lib/auth-content";
import { ReactNode } from "react";
import AuthLogo from "../auth-logo";
import { QuoteCard } from "@/components/ui/quote-card";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Span } from "@/components/ui/typography/Text";

interface Props {
  children: ReactNode;
  variant: AuthVariant;
  /** Shows a back button above the form when provided. */
  onBack?: () => void;
}

export default function AuthLayout({ children, variant, onBack }: Props) {
  const { imageUrl, verse, reference } = AUTH_CONTENT[variant];
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
      <div className="flex items-start sm:items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-4 -ml-2 p-2 gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <Span variant="default">Back</Span>
            </Button>
          )}
          <div className="lg:hidden mb-8">
            <Image
              src="/assets/logo/horizontal/main.png"
              alt="Church Workflow"
              width={190}
              height={58}
              priority
            />
          </div>
          {children}
        </div>
      </div>
      <div
        className="hidden lg:flex relative items-end p-4 my-4 overflow-visible mr-2 rounded-lg bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="relative max-w-lg text-center animate-fade-in">
          <QuoteCard verse={verse} reference={reference} />
        </div>
      </div>

      <div className="hidden lg:flex absolute left-1/2 top-6 -translate-x-1/2 z-20">
        <AuthLogo />
      </div>
    </div>
  );
}
