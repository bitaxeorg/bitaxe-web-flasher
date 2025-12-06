'use client'

import { ExternalLink } from 'lucide-react'

export default function LinksBar() {
  const purchaseLinks = [
    {
      region: "United States",
      url: "https://dub.sh/lIWhNgZ",
      retailer: "US Retailer"
    },
    {
      region: "Europe",
      url: "https://dub.sh/tmPs27j", 
      retailer: "EU Retailer"
    },
    {
      region: "Germany",
      url: "https://dub.sh/NtisWzh", 
      retailer: "German Retailer"
    },
    {
      region: "United Kingdom",
      url: "https://dub.sh/5EXOLfW",
      retailer: "UK Retailer"
    },
    {
      region: "Global",
      url: "https://dub.sh/HoGhuGr",
      retailer: "Global Store"
    }
  ]

  return (
    <section className="w-full pt-16 pb-8 -mt-8 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-100 dark:from-transparent dark:via-gray-900/50 dark:to-gray-800">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Get Your Bitaxe</h2>
          <p className="text-gray-600 dark:text-gray-400">Purchase from retailers worldwide</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {purchaseLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              <span>{link.region}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
