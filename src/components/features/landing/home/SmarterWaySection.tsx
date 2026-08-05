"use client";

import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { FeatureCard } from "@/components/ui/landing-page/FeatureCard";

const features = [
  {
    image: "/landing-page/illustration-1.svg",
    title: "Centralized Administration",
    description: "Unify all church tasks and records in one secure platform.",
  },
  {
    image: "/landing-page/illustration-2.svg",
    title: "Efficient Task Management",
    description: "Delegate tasks, manage reminders, and reduce overload.",
  },
  {
    image: "/landing-page/illustration-3.svg",
    title: "Improved Record-Keeping",
    description: "Track members, events, and finances effortlessly.",
  },
  {
    image: "/landing-page/illustration-4.svg",
    title: "Secure Data Handling",
    description: "Handle sensitive church information with controlled access.",
  },
];

export default function SmarterWaySection() {
  return (
    <section className="relative w-full">
      <img
        loading="lazy"
        decoding="async"
        src="/landing-page/light-blue.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      <div className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Heading
            level={2}
            className="text-4xl font-black text-black inline-flex flex-wrap justify-center gap-x-3"
          >
            <span>A Smarter Way to</span>
            <span className="relative inline-block text-[#0C5FB3]">
              Manage Your Church
              <img
                loading="lazy"
                decoding="async"
                src="/assets/icons/wave.svg"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-2 left-0 w-full h-auto"
              />
            </span>
          </Heading>

          <Text
            variant="muted"
            className="mt-5 text-center max-w-lg mx-auto leading-relaxed"
          >
            Church Workflow unifies administration, automates tasks, and
            simplifies record-keeping — helping church leaders focus on ministry
            instead of paperwork.
          </Text>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
