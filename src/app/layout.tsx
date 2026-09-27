import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientThemeWrapper } from '../components/ClientThemeWrapper'
import { I18nProvider } from '../components/I18nProvider'
import { basePath } from '../lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bitaxe Web Flasher',
  description: 'Flash your Bitaxe directly from the web',
  icons: {
    icon: [
      {
        url: `${basePath}/pictures/logo.png`,
        sizes: 'any',
        type: 'image/png',
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientThemeWrapper>
          <I18nProvider>
              <div className="min-h-screen bg-background text-foreground">
                <main className="w-full p-4">
                  {children}
                </main>
              </div>
          </I18nProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  )
}