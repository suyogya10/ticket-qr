import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from './components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Guard clause: if not logged in, redirect to login
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
      {/* Sidebar Component */}
      <DashboardSidebar userEmail={user.email || ''} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex flex-1 flex-col justify-between min-h-screen px-4 py-8 sm:px-6 md:px-8">
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
            Developed by{' '}
            <a 
              href="https://www.linkedin.com/in/suyogya-gautam-3882b1212/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-cyan-600 font-medium transition-colors"
            >
              Suyogya Gautam
            </a>
          </footer>
        </main>
      </div>
    </div>
  )
}
