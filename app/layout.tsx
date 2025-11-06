import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DashboardLayout from '@/components/layout/DashboardLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prospect Intelligence Dashboard',
  description: 'Generate, analyze, and export prospect data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  )
}

