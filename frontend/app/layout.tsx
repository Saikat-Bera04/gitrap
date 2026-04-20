import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitRap — On-Chain Reputation for Developers',
  description: 'Turn your GitHub activity into a verifiable on-chain reputation score. Connect your wallet and GitHub to mint your developer identity.',
  keywords: ['Web3', 'GitHub', 'Reputation', 'Developer Identity', 'DAO'],
  authors: [{ name: 'GitRap' }],
  openGraph: {
    title: 'GitRap — On-Chain Reputation for Developers',
    description: 'Turn your GitHub activity into a verifiable on-chain reputation score.',
    type: 'website',
    url: 'https://gitrap.io',
    siteName: 'GitRap',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitRap — On-Chain Reputation for Developers',
    description: 'Turn your GitHub activity into a verifiable on-chain reputation score.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased text-[#2d3436] bg-[#e0e5ec]">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
