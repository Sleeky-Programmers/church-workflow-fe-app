"use client";

import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { ChallengeCard } from "@/components/ui/landing-page/ChallengeCard";

const challenges = [
  {
    image: "/landing-page/69c8bde9f582d633a2546f4c077c73a84c064ba8.webp",
    title: "Scattered Records",
    description:
      "Information spread across books, spreadsheets, and different tools.",
  },
  {
    image: "/landing-page/5f8c0a008191a45888ee7f67f299732d717392ea.webp",
    title: "Sensitive Data Risks",
    description:
      "Approvals and records handled without proper structure or security.",
  },
  {
    image: "/landing-page/e122a66e1f91674101d2804aca9eaa258387f350.webp",
    title: "Delays & Confusion",
    description:
      "Tasks, requests, and notifications often get missed or delayed.",
  },
];

export default function ChallengesSection() {
  return (
    <section className="relative bg-white py-24 px-6 overflow-hidden">
      <img
        loading="lazy"
        decoding="async"
        src="/assets/icons/star.svg"
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        className="absolute top-12 right-[10%] select-none pointer-events-none"
      />
      <img
        loading="lazy"
        decoding="async"
        src="/assets/icons/star.svg"
        alt=""
        aria-hidden="true"
        width={28}
        height={28}
        className="absolute bottom-16 left-[8%] select-none pointer-events-none"
      />

      <div className="max-w-4xl mx-auto text-center mb-20">
        <Heading
          level={2}
          className="text-4xl md:text-5xl font-black text-black inline-flex flex-wrap justify-center gap-x-4 items-center"
        >
          <span className="relative inline-block text-[#0C5FB3]">
            The Challenges
            <img
              loading="lazy"
              decoding="async"
              src="/assets/icons/wave.svg"
              alt=""
              aria-hidden="true"
              className="absolute -bottom-2 left-0 w-full h-auto"
            />
          </span>
          <span className="text-black">Churches Face</span>
        </Heading>

        <Text variant="muted" className="mt-6 max-w-xl mx-auto leading-tight">
          These challenges slow down church operations and increase the workload
          <br className="hidden md:block" /> on leaders and administrators.
        </Text>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.title} {...challenge} />
        ))}
      </div>
    </section>
  );
}
