'use client';
import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 shadow-sm' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-10 rounded-lg border-2 border-gray-200">
        <div
          className={`flex items-center justify-between transition-all  duration-300 ${
            scrolled ? 'py-4' : 'py-6'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            
            <Image
              src="/assets/logo/horizontal/main.png"
              alt="Church workflow logo"
              width={100}
              height={100}

            />
            
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#home"
              className="text-gray-700 hover:text-cyan-500 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-gray-700 hover:text-cyan-500 transition-colors duration-200 font-medium"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-gray-700 hover:text-cyan-500 transition-colors duration-200 font-medium"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-gray-700 hover:text-cyan-500 transition-colors duration-200 font-medium"
            >
              Contact
            </Link>
          </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button
              variant="ghost"
              className="hidden sm:inline-flex text-gray-700 hover:text-cyan-500 hover:bg-transparent"
              >
              Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105">
              Get Started
              </Button>
            </Link>
            </div>
        </div>
      </div>
    </header>
  );
}