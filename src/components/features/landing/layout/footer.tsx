'use client';

export default function Footer() {
  const partners = [
    { name: 'ProfitWell', opacity: 0.4 },
    { name: 'Appcues', opacity: 0.4 },
    { name: 'ShipBob', opacity: 0.4 },
    { name: 'Bench', opacity: 0.4 },
    { name: 'Subbly', opacity: 0.4 },
    { name: 'Demio', opacity: 0.4 },
  ];

  return (
    <footer className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
              className="transition-opacity duration-300 hover:opacity-70"
              style={{
                opacity: partner.opacity,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <span className="text-gray-400 text-lg font-medium tracking-wide">
                {partner.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 ">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Church Workflow. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#privacy"
                className="text-gray-500 hover:text-cyan-500 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-gray-500 hover:text-cyan-500 text-sm transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#contact"
                className="text-gray-500 hover:text-cyan-500 text-sm transition-colors duration-200"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}