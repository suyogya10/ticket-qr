import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  Ticket, 
  Calendar, 
  DollarSign, 
  Users, 
  Baby, 
  PlusCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const revalidate = 0 // Disable cache for real-time dashboard data

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch statistics and recent tickets in parallel to prevent sequential network waterfalls
  const [allTicketsResult, recentTicketsResult] = await Promise.all([
    supabase
      .from('tickets')
      .select('amount_paid, adults, kids, created_at, status'),
    supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const allTickets = allTicketsResult.data
  const recentTickets = recentTicketsResult.data

  const tickets = allTickets || []
  const recent = recentTickets || []

  // Stats calculation
  const totalTickets = tickets.length
  
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todaysTickets = tickets.filter(t => new Date(t.created_at) >= startOfToday).length

  const totalRevenue = tickets
    .filter(t => t.status !== 'CANCELLED')
    .reduce((sum, t) => sum + Number(t.amount_paid), 0)

  const totalAdults = tickets
    .filter(t => t.status !== 'CANCELLED')
    .reduce((sum, t) => sum + Number(t.adults), 0)

  const totalKids = tickets
    .filter(t => t.status !== 'CANCELLED')
    .reduce((sum, t) => sum + Number(t.kids), 0)

  const stats = [
    {
      title: 'Total Tickets',
      value: totalTickets,
      description: 'Total registrations entered',
      icon: Ticket,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: "Today's Tickets",
      value: todaysTickets,
      description: 'Entered since midnight',
      icon: Calendar,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Excluding cancelled tickets',
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      title: 'Adults Count',
      value: totalAdults,
      description: 'Total adult attendees',
      icon: Users,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20'
    },
    {
      title: 'Kids Count',
      value: totalKids,
      description: 'Total kid attendees',
      icon: Baby,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time operations overview and quick stats.
          </p>
        </div>
        <Link href="/dashboard/tickets/new" className="inline-flex">
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-sm cursor-pointer">
            <PlusCircle className="h-4.5 w-4.5" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200/80 shadow-xs dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</div>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Layout - Recent & Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tickets Table */}
        <Card className="col-span-2 border-slate-200/80 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-semibold">Newest Tickets</CardTitle>
              <CardDescription>Latest registrations entered by staff</CardDescription>
            </div>
            <Link href="/dashboard/tickets">
              <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 cursor-pointer gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-200 rounded-lg dark:border-slate-800">
                <Ticket className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No tickets found</p>
                <p className="text-xs text-slate-400 mt-1">Create your first ticket to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 dark:border-slate-850">
                      <th className="py-3 px-2">Ticket ID</th>
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Phone</th>
                      <th className="py-3 px-2">Guests</th>
                      <th className="py-3 px-2">Paid</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {recent.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3.5 px-2 font-mono text-xs text-slate-700 dark:text-slate-350">
                          #{String(ticket.id).padStart(5, '0')}
                        </td>
                        <td className="py-3.5 px-2 font-medium text-slate-900 dark:text-slate-100">
                          {ticket.full_name}
                        </td>
                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">
                          {ticket.phone}
                        </td>
                        <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">
                          {ticket.adults}A + {ticket.kids}K
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-slate-900 dark:text-slate-100">
                          ${Number(ticket.amount_paid).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`
                            inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${ticket.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                            ${ticket.status === 'USED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                            ${ticket.status === 'CANCELLED' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' : ''}
                          `}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info & Operations Card */}
        <Card className="border-slate-200/80 shadow-xs dark:border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400 mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold">Verification System</CardTitle>
            <CardDescription>
              To confirm tickets, scan the QR code printed on the receipt. Scanning it opens the public validation page, displaying real-time database status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
            <div className="rounded-lg bg-slate-50 p-4 text-xs space-y-2 dark:bg-slate-900/40">
              <p className="font-semibold text-slate-700 dark:text-slate-350">Status Key:</p>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-350">VALID</strong> - Active, ready to scan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-350">USED</strong> - Already scanned/checked-in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-350">CANCELLED</strong> - Revoked, access denied</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
