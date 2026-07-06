"use client";

import { useState } from "react";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { Check } from "lucide-react";

type BillingCycle = "monthly" | "yearly";

const plans = {
  monthly: [
    {
      name: "Starter",
      price: "₦0",
      period: "/ month",
      features: [
        "Small teams",
        "Membership management",
        "Up to 3 users",
        "Up to 100 members",
        "Attendance tracking",
      ],
      boldFeatures: [],
      popular: false,
    },
    {
      name: "Growth",
      price: "₦20,000",
      period: "/ month",
      features: [
        "Everything in Starter",
        "Up to 10 users",
        "Up to 500 members",
        "Custom roles & permissions",
      ],
      boldFeatures: ["Custom roles & permissions"],
      popular: true,
    },
    {
      name: "Expansion",
      price: "₦45,000",
      period: "/ month",
      features: [
        "Everything in Growth",
        "Up to 25 users",
        "Up to 1,500 members",
      ],
      boldFeatures: [],
      popular: false,
    },
    {
      name: "Enterprise",
      price: "₦100,000",
      period: "/ month",
      features: [
        "Everything in Expansion",
        "Priority support",
        "Unlimited users",
        "Advanced controls",
        "Unlimited members",
      ],
      boldFeatures: ["Unlimited users", "Unlimited members"],
      popular: false,
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: "₦0",
      period: "/ month",
      features: [
        "Small teams",
        "Membership management",
        "Up to 3 users",
        "Up to 100 members",
        "Attendance tracking",
      ],
      boldFeatures: [],
      popular: false,
    },
    {
      name: "Growth",
      price: "₦16,600",
      period: "/ month",
      features: [
        "Everything in Starter",
        "Up to 10 users",
        "Up to 500 members",
        "Custom roles & permissions",
      ],
      boldFeatures: ["Custom roles & permissions"],
      popular: true,
    },
    {
      name: "Expansion",
      price: "₦37,350",
      period: "/ month",
      features: [
        "Everything in Growth",
        "Up to 25 users",
        "Up to 1,500 members",
      ],
      boldFeatures: [],
      popular: false,
    },
    {
      name: "Enterprise",
      price: "₦83,000",
      period: "/ month",
      features: [
        "Everything in Expansion",
        "Priority support",
        "Unlimited users",
        "Advanced controls",
        "Unlimited members",
      ],
      boldFeatures: ["Unlimited users", "Unlimited members"],
      popular: false,
    },
  ],
};

export default function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("yearly");

  return (
    <section id="pricing" className="relative w-full">
      <img
        src="/landing-page/light-blue.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      <div className="relative z-10 py-20 px-6">
        <img
          src="/assets/icons/star.svg"
          alt=""
          aria-hidden="true"
          width={28}
          height={28}
          className="absolute top-12 left-14 select-none pointer-events-none"
        />

        <div className="max-w-3xl mx-auto text-center mb-10">
          <Heading
            level={2}
            className="text-4xl md:text-5xl font-black text-gray-900"
          >
            <span className="relative inline-block text-[#0C5FB3]">
              Flexible Plans
              <img
                src="/assets/icons/wave.svg"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-1 left-0 w-full h-auto"
              />
            </span>{" "}
            for Every Church
          </Heading>

          <Text variant="muted" className="mt-4 max-w-md mx-auto">
            Choose a plan that fits your church size and administrative needs.
          </Text>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex items-center bg-gray-200 rounded-full p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-[#0C5FB3] text-[#ffff] shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                billing === "yearly"
                  ? "bg-[#0C5FB3] text-[#ffff] shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Yearly
            </button>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {billing === "yearly" ? "Save up to 17%" : ""}
          </span>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 items-stretch">
          {plans[billing].map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col h-full rounded-2xl bg-[#ffffff] px-5 py-6 gap-5 ${
                plan.popular
                  ? "border-2 border-[#0C5FB3] shadow-xl"
                  : "border border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0C5FB3] text-[#ffff] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Text variant="label" className="text-gray-800">
                  {plan.name}
                </Text>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-400">{plan.period}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check
                      size={14}
                      className="text-green-600 mt-0.5 shrink-0"
                    />
                    <Text
                      variant={
                        plan.boldFeatures.includes(feature) ? "label" : "muted"
                      }
                      className={`text-xs leading-snug ${
                        plan.boldFeatures.includes(feature)
                          ? "text-gray-900"
                          : ""
                      }`}
                    >
                      {feature}
                    </Text>
                  </div>
                ))}
              </div>

              <button className="w-full rounded-lg mt-auto py-2 px-4 text-sm font-semibold text-[#0C5FB3] bg-[#0C5FB3]/10 cursor-pointer">
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
