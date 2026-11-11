"use client";

import Image from "next/image";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

const steps = [
  {
    step: "STEP ONE",
    title: (
      <>
        Set Up <span className="text-[#0C5FB3]">Your Church</span>
      </>
    ),
    description:
      "Create your church profile, configure roles, and onboard administrators in minutes. Define permissions, assign responsibilities, and prepare your system for smooth operations from day one.",
    image: "/landing-page/f05c6872cdd4d046d8216b2f1e6f66196e7cc1cc.webp",
    imageLeft: false,
  },
  {
    step: "STEP TWO",
    title: (
      <>
        Add <span className="text-[#0C5FB3]">Members &</span>
        <br />
        <span className="text-[#0C5FB3]">Departments</span>
      </>
    ),
    description:
      "Upload or manually add members, church workers, branches, and departments. Organize records, track roles, and centralize information in one structured platform.",
    image: "/landing-page/e4d7323ca9e4d50245fae7b72dbe81ff35d6c04b.webp",
    imageLeft: true,
  },
  {
    step: "STEP THREE",
    title: (
      <>
        Manage <span className="text-[#0C5FB3]">&amp; Grow</span>
      </>
    ),
    description:
      "Track attendance, offerings, tasks, and departmental activities from a single dashboard. Generate reports, monitor progress, and make informed decisions that support church growth.",
    image: "/landing-page/1bad8e22a88e5220a802eb2bb5e59b2f9f709a1c.webp",
    imageLeft: false,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative bg-white py-20 px-6 overflow-hidden"
    >
      <Image
        src="/assets/icons/star.svg"
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        className="absolute top-10 right-16 select-none pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center mb-20">
        <Heading
          level={2}
          className="text-3xl md:text-4xl font-extrabold text-gray-900"
        >
          <span className="relative inline-block text-[#0C5FB3]">
            How Church Workflow Works
            <Image
              src="/assets/icons/wave.svg"
              alt=""
              aria-hidden="true"
              className="absolute -bottom-5 left-0 w-full h-auto" width={0} height={0} sizes="100vw" />
          </span>
        </Heading>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-24">
        {steps.map((step, index) => {
          return (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-12 ${
                step.imageLeft ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 flex flex-col gap-4">
                <Text
                  variant="muted"
                  className="text-xs font-bold tracking-widest uppercase text-[#FF5F00]"
                >
                  {step.step}
                </Text>

                <Heading
                  level={2}
                  className="text-[48px] font-black leading-tight text-gray-900"
                >
                  {step.title}
                </Heading>

                <Text
                  variant="muted"
                  className="text-sm leading-relaxed max-w-sm"
                >
                  {step.description}
                </Text>
              </div>

              <div className="flex-1 relative">
                <Image
                  src="/assets/icons/star.svg"
                  alt=""
                  aria-hidden="true"
                  width={28}
                  height={28}
                  className={`absolute -top-6 select-none pointer-events-none ${
                    step.imageLeft ? "right-4" : "left-4"
                  }`} />
                <Image
                  src={step.image}
                  alt={step.step}
                  width={520}
                  height={360}
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
