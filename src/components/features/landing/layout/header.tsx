"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useAuthStore } from "@/stores/useAuthStore";

import { StickyHeader } from "./sticky-header";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "FEATURES", href: "/#features" },
  { label: "HOW IT WORKS", href: "/#how-it-works" },
  { label: "PRICING", href: "/#pricing" },
  { label: "CONTACT", href: "/#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <StickyHeader>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "py-3" : "py-5"}`}
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

          {/* Desktop Navigation */}
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="default" className="rounded-[8px] px-6">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="rounded-[8px] px-6">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default" className="rounded-[8px] px-6">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Only shows when NOT logged in */}
          <button
            className="md:hidden p-2 z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay - Just Buttons */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel - Centered Buttons */}
            <div className="fixed inset-0 z-40 md:hidden flex items-center justify-center p-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-sm animate-in fade-in zoom-in">
                {/* Close button at top right */}
                <button
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Logo at top of modal */}
                <div className="flex justify-center mb-8">
                  <Image
                    src="/assets/logo/horizontal/main.png"
                    alt="Church Workflow logo"
                    width={140}
                    height={46}
                  />
                </div>

                {/* Heading */}
                <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                  {isAuthenticated ? "Welcome Back" : "Welcome"}
                </h3>
                <p className="text-sm text-center text-gray-500 mb-8">
                  {isAuthenticated
                    ? "Continue to your dashboard"
                    : "Sign in to your account or create a new one"}
                </p>

                {/* Auth Buttons - Large and prominent */}
                <div className="flex flex-col gap-4">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="default"
                        className="w-full rounded-[12px] py-6 text-base font-semibold"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full rounded-[12px] py-6 text-base font-semibold"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="default"
                          className="w-full rounded-[12px] py-6 text-base font-semibold"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StickyHeader>
  );
}
