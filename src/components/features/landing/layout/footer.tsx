'use client'

import { Span } from "@/components/ui/typography/Text"

export default function Footer() {
  const partners = [
    'ProfitWell',
    'Appcues',
    'ShipBob',
    'Bench',
    'Subbly',
    'Demio',
  ]

  return (
    <footer className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 place-items-center">
          {partners.map((partner, index) => (
            <Span
              key={partner}
              className="text-gray-400 text-lg font-medium tracking-wide transition-opacity hover:opacity-70"
              style={{ opacity: 0.4, animationDelay: `${index * 100}ms` }}
            >
              {partner}
            </Span>
          ))}
        </div>

      </div>
    </footer>
  )
}
