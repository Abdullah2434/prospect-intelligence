/**
 * Dashboard Layout Component
 * 
 * Provides the main layout structure with:
 * - Left sidebar navigation
 * - Top header
 * - Main content area
 */

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  Sparkles, 
  List, 
  Network,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Generate Prospects',
    path: '/generate',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    label: 'Prospect List',
    path: '/prospects',
    icon: <List className="w-5 h-5" />,
  },
  {
    label: 'Relationships',
    path: '/relationships',
    icon: <Network className="w-5 h-5" />,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-navy-800 border-r border-navy-700 transition-all duration-300 overflow-hidden flex flex-col fixed lg:static h-full z-40`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-navy-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              Prospect Intelligence
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-navy-700 text-white font-medium shadow-lg'
                    : 'text-white hover:bg-navy-700/50 hover:text-white hover:shadow-md'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-navy-800 hover:text-navy-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:block text-navy-800 hover:text-navy-900"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              <span className="hidden sm:inline">Prospect Intelligence Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

