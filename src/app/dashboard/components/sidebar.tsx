'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Tickets, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  QrCode,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  userEmail: string
}

export default function DashboardSidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Ticket', href: '/dashboard/tickets/new', icon: PlusCircle },
    { name: 'All Tickets', href: '/dashboard/tickets', icon: Tickets },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to log out')
      return
    }
    toast.success('Logged out successfully')
    router.refresh()
    router.push('/login')
  }

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden dark:border-slate-800 dark:bg-slate-900/50 w-full fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <QrCode className="h-4.5 w-4.5" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-50">Ticket QR</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Menu">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed bottom-0 top-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 transition-transform duration-300 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isOpen ? 'pt-0' : 'pt-0 md:pt-0'}
        pt-16 md:pt-0
      `}>
        {/* Desktop Title Header */}
        <div className="hidden h-16 items-center border-b border-slate-100 bg-white px-6 md:flex dark:border-slate-800 dark:bg-transparent">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-50 text-lg">Ticket QR</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group cursor-pointer
                  ${isActive 
                    ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-100'
                  }
                `}
              >
                <item.icon className={`
                  h-5 w-5 transition-colors duration-200
                  ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300'}
                `} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer (User info & Log out) */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-lg px-2 py-3 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">Staff Access</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{userEmail}</p>
            </div>
          </div>

          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="mt-3 w-full justify-start text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 gap-3 px-3 cursor-pointer h-10"
          >
            <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-600" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
