import { Mail, MessageCircle, Phone } from "lucide-react";

import { generateSeoMetadata } from "@/lib/seo";
import Header from "@/components/features/landing/layout/header";
import Footer from "@/components/features/landing/layout/footer";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

export const metadata = generateSeoMetadata({
  title: "Contact Us | Church Workflow",
  description:
    "Get in touch with the Church Workflow team by email, WhatsApp, or phone.",
  path: "/contact",
});

const CONTACT_EMAIL = "support@churchworkflow.com";
const CONTACT_PHONE_DISPLAY = "+234 916 095 2000";
const CONTACT_WHATSAPP_LINK = "https://wa.me/2349160952000";

const channels = [
  {
    icon: Mail,
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: CONTACT_PHONE_DISPLAY,
    href: CONTACT_WHATSAPP_LINK,
  },
  {
    icon: Phone,
    label: "Phone",
    value: CONTACT_PHONE_DISPLAY,
    href: `tel:+2349160952000`,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-white overflow-x-hidden">
      <Header />

      <section className="max-w-2xl mx-auto px-6 pt-32 pb-24 md:pt-40 text-center">
        <Heading level={1} className="text-3xl md:text-5xl font-black mb-4">
          Get in Touch
        </Heading>
        <Text variant="muted" className="text-base md:text-lg mb-12">
          Have a question about Church Workflow, or need help with your account?
          Reach out through any of the channels below - our team aims to get
          back to you as quickly as possible.
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {channels.map(({ icon: Icon, label, value, href }) => {
            return (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Icon className="w-6 h-6 text-[#0C5FB3]" />
                <Text className="font-semibold">{label}</Text>
                <Text variant="muted" className="text-sm">
                  {value}
                </Text>
              </a>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
