import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import TicketQrCanvas from './components/ticket-qr-canvas'
import CheckInButton from './components/check-in-button'
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Users, 
  DollarSign, 
  CreditCard,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ uuid: string }>
}

interface PublicTicket {
  id: number
  uuid: string
  full_name: string
  phone: string
  adults: number
  kids: number
  amount_paid: number
  payment_method: string
  remarks: string | null
  status: string
  created_at: string
}

export const revalidate = 0 // Ensure real-time gate validation matches the database instantly

export default async function PublicTicketPage({ params }: PageProps) {
  const resolvedParams = await params
  const { uuid } = resolvedParams

  // Derive absolute base URL from request headers (works in both dev and production)
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'ticket-qr-weld.vercel.app'
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const siteOrigin = `${proto}://${host}`
  const ticketUrl = `${siteOrigin}/ticket/${uuid}`

  const supabase = await createClient()

  // Execute secure RPC query and retrieve logged-in status in parallel
  const [ticketResult, authResult] = await Promise.all([
    supabase.rpc('get_public_ticket', { ticket_uuid: uuid }),
    supabase.auth.getUser()
  ])

  const { data, error } = ticketResult
  const { data: { user } } = authResult

  // If error occurs or no ticket is found, trigger the custom 404 handler
  if (error || !data || data.length === 0) {
    notFound()
  }

  const ticket = data[0] as PublicTicket
  const isStaff = !!user

  // Status visual maps
  const statusConfig = {
    VALID: {
      color: 'bg-emerald-50 text-emerald-800 border-emerald-255 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
      badge: 'bg-emerald-500 text-white',
      icon: CheckCircle2,
      title: 'Verified Ticket',
      subtitle: 'This pass is active and valid for entry.'
    },
    USED: {
      color: 'bg-amber-50 text-amber-800 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
      badge: 'bg-amber-500 text-white',
      icon: AlertTriangle,
      title: 'Already Used',
      subtitle: 'This pass was already scanned at check-in.'
    },
    CANCELLED: {
      color: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
      badge: 'bg-red-500 text-white',
      icon: XCircle,
      title: 'Cancelled',
      subtitle: 'This pass has been cancelled or revoked.'
    }
  }[ticket.status as 'VALID' | 'USED' | 'CANCELLED'] || {
    color: 'bg-slate-50 text-slate-800 border-slate-200',
    badge: 'bg-slate-500 text-white',
    icon: AlertTriangle,
    title: 'Unknown',
    subtitle: 'Ticket state is unrecognized.'
  }

  const StatusIcon = statusConfig.icon

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950/20">
      <div className="w-full max-w-[420px]">
        {/* Ticket Portal branding */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <span className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Gate Verification</span>
        </div>

        {/* Verification Status Card */}
        <Card className="border-slate-200 shadow-xl overflow-hidden rounded-2xl dark:border-slate-800">
          {/* Event Banner */}
          <div className="w-full overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-slate-950 flex justify-center items-center">
            <img 
              src="/ticket.jpg" 
              alt="Event Banner" 
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Status Indicator Banner */}
          <div className={`flex flex-col items-center justify-center p-6 border-b text-center ${statusConfig.color}`}>
            <StatusIcon className="h-12 w-12 mb-3" />
            <h1 className="text-xl font-bold tracking-tight">{statusConfig.title}</h1>
            <p className="text-xs opacity-90 mt-1">{statusConfig.subtitle}</p>
          </div>

          <CardContent className="p-6 space-y-6 bg-white dark:bg-slate-900">
            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <TicketQrCanvas
                value={ticketUrl}
                size={140}
              />
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-2">
                Ticket ID: #{String(ticket.id).padStart(5, '0')}
              </span>
            </div>

            {/* Ticket Information Details */}
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {/* Guest Name */}
              <div className="flex justify-between items-center text-sm pt-0">
                <span className="text-slate-450 dark:text-slate-500 font-medium">Guest Name</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{ticket.full_name}</span>
              </div>

              {/* Guests Count */}
              <div className="flex justify-between items-center text-sm pt-4">
                <span className="text-slate-455 dark:text-slate-500 font-medium flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" />
                  Attendees
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ticket.adults} Adults, {ticket.kids} Kids
                </span>
              </div>

              {/* Amount Paid */}
              <div className="flex justify-between items-center text-sm pt-4">
                <span className="text-slate-455 dark:text-slate-500 font-medium flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  Amount Paid
                </span>
                <span className="font-bold text-slate-950 dark:text-slate-50">
                  ${Number(ticket.amount_paid).toFixed(2)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex justify-between items-center text-sm pt-4">
                <span className="text-slate-455 dark:text-slate-500 font-medium flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  Payment Method
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-350">
                  {ticket.payment_method}
                </span>
              </div>

              {/* Created Time */}
              <div className="flex justify-between items-center text-sm pt-4">
                <span className="text-slate-455 dark:text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Purchase Date
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">
                  {new Date(ticket.created_at).toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Check-In Button for Staff */}
            {isStaff && ticket.status === 'VALID' && (
              <CheckInButton ticketId={ticket.id} />
            )}
          </CardContent>
        </Card>

        {/* Footer Credit */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Developed by{' '}
          <a 
            href="https://www.linkedin.com/in/suyogya-gautam-3882b1212/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-cyan-600 font-medium transition-colors"
          >
            Suyogya Gautam
          </a>
        </p>
      </div>
    </main>
  )
}
