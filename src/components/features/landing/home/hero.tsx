"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col md:flex-row items-stretch overflow-hidden">
      <div className="relative flex items-center justify-center w-full md:w-1/2 bg-white px-8 md:px-16 py-24 md:py-0">
        <div
          className={`w-full max-w-lg space-y-6 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Heading
            level={1}
            className="text-4xl md:text-5xl font-black leading-tight text-gray-900"
          >
            <span className="relative inline-block text-[#0C5FB3]">
              Simplify
              <img
                src="/assets/icons/wave.svg"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-1 left-0 w-full h-auto"
              />
            </span>{" "}
            Church
            <br />
            Operations
          </Heading>

          <div className="relative">
            <img
              src="/assets/icons/star.svg"
              alt=""
              width={36}
              height={36}
              aria-hidden="true"
              className="absolute -top-3 -right-6 select-none pointer-events-none"
            />
            <Text variant="muted" className="font-medium leading-relaxed">
              All-in-one software that helps churches manage
              <br />
              tasks, records, and workflows with ease.
            </Text>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="default" size="lg" className="rounded-[8px] px-7">
              Request a Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-[8px] px-7 border-[#0C5FB3] text-[#0C5FB3] hover:bg-gray-50 hover:text-[#0C5FB3]"
            >
              See How It Works
            </Button>
          </div>

          <img
            src="/assets/icons/star.svg"
            alt=""
            width={36}
            height={36}
            aria-hidden="true"
            className="select-none pointer-events-none"
          />
        </div>
      </div>

      <div
        className="relative flex items-center justify-center w-full md:w-1/2 px-8 md:px-10 py-20"
        style={{ backgroundColor: "#F3F7FB" }}
      >
        <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === 0 ? "bg-[#0C5FB3]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div
          className={`relative transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="absolute -top-5 -left-8 z-10">
            <FloatingBadge
              icon={<IconFolderCheckFill size={28} />}
              label="All-in-One"
            />
          </div>

          <div className="absolute top-1/3 -right-12 z-10">
            <FloatingBadge
              icon={<IconSettingsFill size={28} />}
              label="Automated"
            />
          </div>

          <div className="absolute -bottom-5 left-6 z-10">
            <FloatingBadge
              icon={<IconShieldCheckFill size={28} />}
              label="Secure"
            />
          </div>

          <div className="relative w-full max-w-[460px] mx-auto">
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
