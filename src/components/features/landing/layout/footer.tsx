import Image from "next/image";
import Link from "next/link";
import { Text } from "@/components/ui/typography/Text";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Sign Up", href: "/auth/signup" },
  { label: "Login", href: "/auth/login" },
  { label: "Contact", href: "/contact" },
];

const solutionLinks = [
  { label: "Church Management Software", href: "/church-management-software" },
  {
    label: "Church Administration Software",
    href: "/church-administration-software",
  },
  {
    label: "Church Management Software Nigeria",
    href: "/church-management-software-nigeria",
  },
];

// Help Center, Documentation, and Support were removed rather than pointed
// at real pages — no content exists yet for any of them, and a dead link is
// worse than no link. Add them back once there's something to link to.
const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative w-full overflow-hidden">
      <img
        loading="lazy"
        decoding="async"
        src="/landing-page/darkblue.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image
                loading="lazy"
                src="/assets/logo/horizontal/white.png"
                alt="Church Workflow logo"
                width={148}
                height={148}
              />
            </div>
            <p className="text-[#ffff]/70 text-sm leading-relaxed max-w-xs">
              Simplifying church administration and empowering ministry through
              structured, secure, and centralized management.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[#ffff] font-bold text-sm">Product</p>
            <div className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[#ffff]/70 text-sm hover:text-[#ffff] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[#ffff] font-bold text-sm">Solutions</p>
            <div className="flex flex-col gap-3">
              {solutionLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[#ffff]/70 text-sm hover:text-[#ffff] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[#ffff] font-bold text-sm">Legal</p>
            <div className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[#ffff]/70 text-sm hover:text-[#ffff] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 flex items-center justify-center">
          <p className="text-[#ffff]/60 text-xs">
            © 2026 Church Workflow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
