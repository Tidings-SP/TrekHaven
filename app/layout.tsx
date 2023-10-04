import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/theme-provider'
import SessionProvider from './authentication/session-provider'
import TopNavBar from '@/components/navbar/top-navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trek Haven',
  description: 'Find The Best Accommodations Here!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute='class' defaultTheme='light'>
          <SessionProvider>
            
            {children}
          </SessionProvider>
        </ThemeProvider></body>
    </html>
  )
}
