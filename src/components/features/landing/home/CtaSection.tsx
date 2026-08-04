"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { FloatingBadge } from "@/components/ui/landing-page/FloatingBadge";

const IconFolderCheckFill = dynamic(
  () => import("obra-icons-react").then((mod) => mod.IconFolderCheckFill),
  { ssr: false },
);
const IconSettingsFill = dynamic(
  () => import("obra-icons-react").then((mod) => mod.IconSettingsFill),
  { ssr: false },
);
const IconShieldCheckFill = dynamic(
  () => import("obra-icons-react").then((mod) => mod.IconShieldCheckFill),
  { ssr: false },
);

export default function CtaSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[600px] flex items-stretch overflow-hidden">
      <img
        loading="lazy"
        decoding="async"
        src="/landing-page/light-blue.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center px-8 md:px-16 py-20 gap-12">
        <div
          className={`flex-1 flex flex-col gap-6 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="absolute top-12 left-6 select-none pointer-events-none opacity-30">
            <img
              loading="lazy"
              decoding="async"
              src="/assets/icons/star.svg"
              alt=""
              aria-hidden="true"
              width={80}
              height={80}
            />
          </div>

          <Heading
            level={2}
            className="text-4xl md:text-5xl font-black text-gray-900 leading-tight"
          >
            Ready to Simplify Your
            <br />
            <span className="relative inline-block text-[#0C5FB3]">
              Church Operations?
              <img
                loading="lazy"
                decoding="async"
                src="/assets/icons/wave.svg"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-4 left-0 w-full h-auto"
              />
            </span>
          </Heading>

          <Text variant="muted" className="text-sm leading-relaxed max-w-md">
            Join hundreds of church leaders who have streamlined administration,
            automated tasks, and improved decision-making with Church Workflow.
          </Text>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/auth/signup">
              <Button
                variant="default"
                size="lg"
                className="rounded-[8px] px-7"
              >
                Sign Up
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="rounded-[8px] px-7 border-[#0C5FB3] text-[#0C5FB3] hover:bg-white hover:text-[#0C5FB3]"
            >
              Start Free Plan
            </Button>
          </div>
        </div>

        <div
          className={`flex-1 relative flex items-center justify-center transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="absolute -top-5 left-0 z-10">
            <FloatingBadge
              icon={<IconFolderCheckFill size={28} />}
              label="All-in-One"
            />
          </div>

          <div className="absolute top-1/3 -right-4 z-10">
            <FloatingBadge
              icon={<IconSettingsFill size={28} />}
              label="Automated"
            />
          </div>

          <div className="absolute -bottom-5 left-1/4 z-10">
            <FloatingBadge
              icon={<IconShieldCheckFill size={28} />}
              label="Secure"
            />
          </div>

          <div className="relative w-[460px]">
            <Image
              src="/landing-page/f7231d12c7971edd138487e47e3a828f4441f808(1).png"
              alt="Church Workflow dashboard on Mac Studio"
              width={460}
              height={380}
              priority
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
