"use client";

import { useEffect, useState } from "react";
import { ReactNode } from "react";

type StickyHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function StickyHeader({ children, className }: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      return setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      return window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-sm backdrop-blur-md" : "bg-transparent"
      } ${className || ""}`}
      style={
        scrolled ? { backgroundColor: "rgba(243, 247, 251, 0.85)" } : undefined
      }
    >
      {children}
    </header>
  );
}
