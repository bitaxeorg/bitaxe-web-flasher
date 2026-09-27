import Link from 'next/link'
import { useState } from 'react'
import { X } from 'lucide-react'

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)

  return (
    <>
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className=" rounded-lg p-6 max-w-md relative">
            <button
              onClick={() => setShowPrivacy(false)}
              className="absolute right-4 top-4 hover:text-gray-700"
            >
              <X size={35} />
            </button>
            <div className="text-center">
              <h2 className="text-lg">Privacy Notice</h2>
              <p>We collect no data but your ISP does.</p>
            </div>
          </div>
        </div>
      )}

      {showTermsOfService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className=" rounded-lg p-6 max-w-md relative">
          <button
            onClick={() => setShowTermsOfService(false)}
            className="absolute right-4 top-4 hover:text-gray-700"
          >
            <X size={35} />
          </button>
          <div className="text-center">
            <h2 className="text-lg">Terms</h2>
            <p>The source code is provided under GPL-V3 License.</p>
          </div>
        </div>
      </div>
      )}

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2026 Bitaxe Web Flasher. All rights reserved.</p>
        <Link className="text-xs hover:underline underline-offset-4" href="https://wantclue.de">
          Maintained by WantClue
        </Link>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <button 
            onClick={() => setShowTermsOfService(true)} 
            className="text-xs hover:underline underline-offset-4"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => setShowPrivacy(true)} 
            className="text-xs hover:underline underline-offset-4"
          >
            Privacy
          </button>
        </nav>
      </footer>
    </>
  )
}