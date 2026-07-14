import { createClient } from '@/lib/supabase/server'
import TicketsList from './components/tickets-list'

export const revalidate = 0 // Fetch fresh data on every request

export default async function TicketsPage() {
  const supabase = await createClient()

  // Fetch all tickets ordered by creation time
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Tickets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage all guest passes, search registrations, edit details, or revoke tickets.
        </p>
      </div>

      <TicketsList initialTickets={tickets || []} />
    </div>
  )
}
