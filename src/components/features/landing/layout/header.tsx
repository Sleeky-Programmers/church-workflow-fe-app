"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { StickyHeader } from "./sticky-header";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "FEATURES", href: "#features" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "PRICING", href: "#pricing" },
  { label: "CONTACT", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <StickyHeader>
      <div className="max-w-7xl mx-auto px-10">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          <Link href="/">
            <Image
              src="/assets/logo/horizontal/main.png"
              alt="Church Workflow logo"
              width={120}
              height={40}
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-semibold tracking-widest text-gray-900 no-underline hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/auth/login">
            <Button variant="default" className="rounded-[8px] px-6">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </StickyHeader>
  );
}
