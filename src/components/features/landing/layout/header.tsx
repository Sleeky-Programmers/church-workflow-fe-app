'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 shadow-sm backdrop-blur' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-10">
        <div
          className={`flex items-center justify-between border border-gray-200 rounded-lg transition-all duration-300 ${
            scrolled ? 'py-4' : 'py-6'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo/horizontal/main.png"
              alt="Church Workflow logo"
              width={120}
              height={40}
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `#${item.toLowerCase()}`}
                className="font-medium text-gray-700 transition-colors hover:text-cyan-500"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-gray-700 hover:text-cyan-500"
              >
                Log in
              </Button>
            </Link>

            <Link href="/auth/signup">
              <Button className="bg-cyan-500 text-white px-6 shadow-lg shadow-cyan-500/30 hover:bg-cyan-600 hover:shadow-xl hover:shadow-cyan-500/40 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
