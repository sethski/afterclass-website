import type { Metadata } from 'next'
import { snPro, openSauceTwo } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afterclassapp.com'
  ),
  title: {
    default: 'After Class — The first move is showing up',
    template: '%s · After Class',
  },
  description:
    'Every other app gets you a match. After Class gets you a date. Verified students, planned meetups, local spots near campus.',
  openGraph: {
    title: 'After Class — The first move is showing up',
    description:
      'Every other app gets you a match. After Class gets you a date.',
    siteName: 'After Class',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${snPro.variable} ${openSauceTwo.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
