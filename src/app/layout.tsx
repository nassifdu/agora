import type { Metadata } from 'next'
import { Playfair_Display, EB_Garamond } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  display: 'swap',
})

const garamond = EB_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-garamond',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ἀγορά — A Gallery of Thoughts',
  description: 'A curated space for ideas, reflections, and fragments of thought.',
  openGraph: {
    title: 'ἀγορά',
    description: 'A curated space for ideas, reflections, and fragments of thought.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${garamond.variable}`}>
      <body>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="mt-24 pb-10">
          <hr className="gold-rule mb-8" />
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p style={{ fontFamily: 'var(--font-garamond)', color: 'var(--color-stone-light)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              ἀγορά — a place where thoughts meet
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
