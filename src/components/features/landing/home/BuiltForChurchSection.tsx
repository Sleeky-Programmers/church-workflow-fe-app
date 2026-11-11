"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

const OiShieldCheck = dynamic(
  () => {
    return import("obra-icons-react").then((mod) => {
      return mod.IconShieldCheck;
    });
  },
  { ssr: false },
);
const OiCodeBranch = dynamic(
  () => {
    return import("obra-icons-react").then((mod) => {
      return mod.IconCodeBranch;
    });
  },
  { ssr: false },
);
const OiBarChartThin = dynamic(
  () => {
    return import("obra-icons-react").then((mod) => {
      return mod.IconBarChartThin;
    });
  },
  { ssr: false },
);
const IconArrowRightUp = dynamic(
  () => {
    return import("obra-icons-react").then((mod) => {
      return mod.IconArrowRightUp;
    });
  },
  { ssr: false },
);

const features = [
  {
    icon: <OiShieldCheck size={20} />,
    title: "Secure & Role-Based Access",
    description:
      "Control who does what. Protect sensitive church data with structured permissions.",
  },
  {
    icon: <OiCodeBranch size={20} />,
    title: "Multi-Branch Ready",
    description:
      "Whether you're onboarding 100 or 1,000+ members, Church Workflow grows with you.",
  },
  {
    icon: <OiBarChartThin size={20} />,
    title: "Scalable for Growth",
    description:
      "Whether you're onboarding 100 or 1,000+ members, Church Workflow grows with you.",
  },
  {
    icon: <IconArrowRightUp size={20} />,
    title: "Structured & Reliable",
    description:
      "Designed to reduce confusion, eliminate duplication, and improve operational clarity.",
  },
];

export default function BuiltForChurchSection() {
  return (
    <section
      id="features-built"
      className="relative bg-white py-20 px-6 overflow-hidden"
    >
      <Image
        src="/assets/icons/star.svg"
        alt=""
        aria-hidden="true"
        width={28}
        height={28}
        className="absolute top-10 right-10 select-none pointer-events-none" />
      <Image
        src="/assets/icons/star.svg"
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className="absolute bottom-10 right-16 select-none pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 flex flex-col gap-8">
          <Heading
            level={2}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
          >
            Built Specifically for
            <br />
            <span className="relative inline-block text-blue-600">
              Church Administration
              <Image
                src="/assets/icons/wave.svg"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-2 left-0 w-full h-auto" width={0} height={0} sizes="100vw" />
            </span>
          </Heading>

          <div className="flex flex-col gap-6">
            {features.map((feature) => {
              return (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[13px] bg-white border border-gray-200 shadow-[0px_3px_0px_0px_#e5e7eb] flex items-center justify-center shrink-0 text-blue-600">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <Heading
                      level={5}
                      className="font-bold text-gray-900 text-sm"
                    >
                      {feature.title}
                    </Heading>
                    <Text variant="muted" className="text-xs leading-relaxed">
                      {feature.description}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center">
          <Image
            src="/assets/icons/star.svg"
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="absolute top-0 left-4 select-none pointer-events-none" />
          <Image
            src="/landing-page/built-for-church-illustration.svg"
            alt="Church administration illustration"
            width={520}
            height={420}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
