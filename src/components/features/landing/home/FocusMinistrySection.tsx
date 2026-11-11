"use client";

import { Text } from "@/components/ui/typography/Text";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const benefits = [
  {
    number: "01",
    title: "Save Time & Reduce Manual Work",
    description:
      "Church Workflow automates repetitive administrative processes such as member tracking, attendance logging, and task delegation. By centralizing operations, church leaders and administrators spend less time on paperwork and more time on ministry impact.",
    firstItem: true,
  },
  {
    number: "02",
    title: "Improve Coordination Across Departments",
    description:
      "Keep pastors, workers, media teams, finance units, and department heads aligned within one unified system. Clear task assignments, reminders, and structured communication eliminate confusion and improve teamwork.",
    firstItem: false,
  },
  {
    number: "03",
    title: "Enhance Record Accuracy & Transparency",
    description:
      "Maintain up-to-date member records, financial entries, attendance logs, and departmental data. Structured data improves reporting accuracy and ensures accountability across the organization.",
    firstItem: false,
  },
  {
    number: "04",
    title: "Make Data-Driven Decisions",
    description:
      "Access real-time insights through dashboards and reports. Church leaders can evaluate performance, monitor growth trends, and make informed strategic decisions confidently.",
    firstItem: false,
  },
  {
    number: "05",
    title: "Strengthen Data Security & Role Control",
    description:
      "Sensitive church information is protected with role-based access controls and structured permissions. Only authorized users can access specific data, reducing privacy risks.",
    firstItem: false,
  },
];

export default function FocusMinistrySection() {
  return (
    <section id="features" className="relative w-full">
      <Image
        src="/landing-page/darkblue.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none" fill sizes="100vw" />

      <div className="relative z-10 py-20 px-6">
        <Image
          src="/assets/icons/star.svg"
          alt=""
          aria-hidden="true"
          width={28}
          height={28}
          className="absolute top-10 left-12 select-none pointer-events-none"
          style={{ filter: "brightness(0) invert(1) opacity(0.6)" }} />

        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#ffff] leading-tight">
            <span className="relative inline-block">
              Focus More on Ministry.
              <Image
                src="/assets/icons/wave.svg"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-6 left-0 w-full h-auto" width={0} height={0} sizes="100vw" />
            </span>
            <br />
            Less on Administration.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col divide-y divide-[#ffff]/20">
          {benefits.map((benefit) => {
            return (
              <div
                key={benefit.number}
                className="flex items-start gap-6 py-7 group"
              >
                <span className="text-[#ffff] font-bold text-lg w-10 shrink-0 pt-0.5">
                  {benefit.number}
                </span>

                <div className="flex-1 flex flex-col gap-1.5">
                  <p className="font-bold text-[#ffff] text-base md:text-lg">
                    {benefit.title}
                  </p>
                  <Text
                    variant="muted"
                    className="text-[#ffff]/70 text-sm leading-relaxed"
                  >
                    {benefit.description}
                  </Text>
                </div>

                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5 transition-all ${
                    benefit.firstItem
                      ? "bg-[#ffffff] text-[#0C5FB3] border border-[#ffffff]"
                      : "bg-[#ffffff]/20 backdrop-blur-sm border border-[#0C5FB3]/30 text-[#ffff]"
                  }`}
                >
                  <ArrowRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
