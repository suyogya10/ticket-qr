'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Search, 
  Edit, 
  Trash2, 
  QrCode, 
  Phone, 
  Check, 
  X,
  ExternalLink,
  ChevronDown,
  Filter,
  Download,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QRCodeCanvas } from 'qrcode.react'

interface Ticket {
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

interface TicketsListProps {
  initialTickets: Ticket[]
}

export default function TicketsList({ initialTickets }: TicketsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isPending, startTransition] = useTransition()

  // Modal States
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null)
  const [qrTicket, setQrTicket] = useState<Ticket | null>(null)

  const ticketRef = useRef<HTMLDivElement>(null)

  // PNG Export
  const downloadPNG = async (ticket: Ticket) => {
    if (!ticketRef.current) return
    try {
      const html2canvasModule = await import('html2canvas-pro')
      const html2canvasFn = html2canvasModule.default || html2canvasModule
      
      const canvas = await html2canvasFn(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      })
      const link = document.createElement('a')
      link.download = `ticket-${String(ticket.id).padStart(5, '0')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('PNG downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PNG')
    }
  }

  // PDF Export
  const downloadPDF = async (ticket: Ticket) => {
    if (!ticketRef.current) return
    try {
      const html2canvasModule = await import('html2canvas-pro')
      const html2canvasFn = html2canvasModule.default || html2canvasModule
      
      const { jsPDF } = await import('jspdf')
      
      const canvas = await html2canvasFn(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      })
      const imgData = canvas.toDataURL('image/png')
      
      const imgWidth = 148
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight] // Fit page dimensions to the ticket exactly
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`ticket-${String(ticket.id).padStart(5, '0')}.pdf`)
      toast.success('PDF downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PDF')
    }
  }

  // Edit Form Fields State
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAdults, setEditAdults] = useState(1)
  const [editKids, setEditKids] = useState(0)
  const [editAmount, setEditAmount] = useState(0)
  const [editMethod, setEditMethod] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editRemarks, setEditRemarks] = useState('')

  // Open Edit Modal
  const openEdit = (ticket: Ticket) => {
    setEditTicket(ticket)
    setEditName(ticket.full_name)
    setEditPhone(ticket.phone)
    setEditAdults(ticket.adults)
    setEditKids(ticket.kids)
    setEditAmount(ticket.amount_paid)
    setEditMethod(ticket.payment_method)
    setEditStatus(ticket.status)
    setEditRemarks(ticket.remarks || '')
  }

  // Handle Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTicket) return

    startTransition(async () => {
      const { error } = await supabase
        .from('tickets')
        .update({
          full_name: editName,
          phone: editPhone,
          adults: editAdults,
          kids: editKids,
          amount_paid: editAmount,
          payment_method: editMethod,
          status: editStatus,
          remarks: editRemarks || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editTicket.id)

      if (error) {
        toast.error(error.message || 'Failed to update ticket')
        return
      }

      // Update local state
      setTickets(prev => prev.map(t => t.id === editTicket.id ? {
        ...t,
        full_name: editName,
        phone: editPhone,
        adults: editAdults,
        kids: editKids,
        amount_paid: editAmount,
        payment_method: editMethod,
        status: editStatus,
        remarks: editRemarks || null,
      } : t))

      toast.success('Ticket updated successfully!')
      setEditTicket(null)
      router.refresh()
    })
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTicket) return

    startTransition(async () => {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', deleteTicket.id)

      if (error) {
        toast.error(error.message || 'Failed to delete ticket')
        return
      }

      // Update local state
      setTickets(prev => prev.filter(t => t.id !== deleteTicket.id))
      toast.success('Ticket deleted successfully')
      setDeleteTicket(null)
      router.refresh()
    })
  }

  // WhatsApp Share Handler
  const handleWhatsAppShare = (ticket: Ticket) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://domain.com'
    const verificationUrl = `${origin}/ticket/${ticket.uuid}`
    const message = `Hello ${ticket.full_name}!\n\nThank you for your payment. Here is your entry pass:\n🎫 Ticket ID: #${String(ticket.id).padStart(5, '0')}\n- Attendees: ${ticket.adults} Adults, ${ticket.kids} Kids\n- Paid: $${Number(ticket.amount_paid).toFixed(2)}\n\nLink to display QR code at gate:\n👉 ${verificationUrl}`
    const cleanPhone = ticket.phone.replace(/[^0-9+]/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Search and Filter Logic
  const filteredTickets = tickets.filter(ticket => {
    const formattedId = `#${String(ticket.id).padStart(5, '0')}`
    const matchesSearch = 
      ticket.full_name.toLowerCase().includes(search.toLowerCase()) ||
      ticket.phone.includes(search) ||
      ticket.uuid.toLowerCase().includes(search.toLowerCase()) ||
      formattedId.includes(search)

    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900/40 p-4 border border-slate-200/80 dark:border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone, ticket ID, UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-slate-200 focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100/80 dark:bg-slate-800/40 p-1 rounded-lg">
          {['ALL', 'VALID', 'USED', 'CANCELLED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`
                px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer
                ${statusFilter === filter 
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100' 
                  : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
        <CardContent className="p-0">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching tickets</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your query or filter keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-semibold text-slate-400 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Guests</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/5">
                      <td className="py-4 px-4 font-mono text-xs text-slate-700 dark:text-slate-350">
                        #{String(ticket.id).padStart(5, '0')}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {ticket.full_name}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {ticket.phone}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                        {ticket.adults}A + {ticket.kids}K
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        ${Number(ticket.amount_paid).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-450 font-medium">
                          {ticket.payment_method}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`
                          inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                          ${ticket.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                          ${ticket.status === 'USED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                          ${ticket.status === 'CANCELLED' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' : ''}
                        `}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* QR preview button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQrTicket(ticket)}
                            title="View QR Code"
                            className="h-8 w-8 hover:text-cyan-600 cursor-pointer"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>

                          {/* WhatsApp share */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleWhatsAppShare(ticket)}
                            title="Share via WhatsApp"
                            className="h-8 w-8 hover:text-emerald-600 cursor-pointer"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>

                          {/* Edit button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(ticket)}
                            title="Edit Ticket"
                            className="h-8 w-8 hover:text-blue-600 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTicket(ticket)}
                            title="Delete Ticket"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/25 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. EDIT DIALOG */}
      <Dialog open={editTicket !== null} onOpenChange={(open) => !open && setEditTicket(null)}>
        <DialogContent className="max-w-md border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle>Edit Ticket Registration</DialogTitle>
            <DialogDescription>
              Modify Guest information, guests counts, payment records, or ticket validation state.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-adults">Adults Count</Label>
                  <Input
                    id="edit-adults"
                    type="number"
                    min="0"
                    value={editAdults}
                    onChange={e => setEditAdults(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-kids">Kids Count</Label>
                  <Input
                    id="edit-kids"
                    type="number"
                    min="0"
                    value={editKids}
                    onChange={e => setEditKids(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-amount">Amount Paid ($)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editAmount}
                    onChange={e => setEditAmount(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-status">Ticket Status</Label>
                  <Select value={editStatus} onValueChange={(val) => setEditStatus(val || '')}>
                    <SelectTrigger id="edit-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VALID">VALID</SelectItem>
                      <SelectItem value="USED">USED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-method">Payment Method</Label>
                <Select value={editMethod} onValueChange={(val) => setEditMethod(val || '')}>
                  <SelectTrigger id="edit-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card / POS</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="ONLINE_WALLET">Online Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Input
                  id="edit-remarks"
                  value={editRemarks}
                  onChange={e => setEditRemarks(e.target.value)}
                  placeholder="Operational notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTicket(null)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer">
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteTicket !== null} onOpenChange={(open) => !open && setDeleteTicket(null)}>
        <DialogContent className="max-w-md border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              ⚠️ Revoke & Delete Ticket?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this ticket for <strong>{deleteTicket?.full_name}</strong>? This will revoke gate access immediately. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteTicket(null)} className="cursor-pointer">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDeleteConfirm}
              disabled={isPending} 
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {isPending ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 3. QR PREVIEW MODAL */}
      <Dialog open={qrTicket !== null} onOpenChange={(open) => !open && setQrTicket(null)}>
        <DialogContent className="max-w-[340px] flex flex-col items-center justify-center border-slate-200 dark:border-slate-800">
          <DialogHeader className="w-full text-center">
            <DialogTitle>Ticket Pass QR</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              ID: #{String(qrTicket?.id).padStart(5, '0')}
            </DialogDescription>
          </DialogHeader>

          {qrTicket && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 my-2">
              <QRCodeCanvas
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ticket/${qrTicket.uuid}`}
                size={180}
                level="H"
                includeMargin={true}
                className="bg-white p-2 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-2 font-mono text-center truncate w-full max-w-[240px]">
                {qrTicket.full_name}
              </span>
              <span className={`
                mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                ${qrTicket.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                ${qrTicket.status === 'USED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                ${qrTicket.status === 'CANCELLED' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' : ''}
              `}>
                {qrTicket.status}
              </span>
            </div>
          )}

          {qrTicket && (
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <Button 
                variant="outline" 
                onClick={() => downloadPNG(qrTicket)}
                className="gap-1.5 text-xs h-9 cursor-pointer border-slate-200 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                PNG
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadPDF(qrTicket)}
                className="gap-1.5 text-xs h-9 cursor-pointer border-slate-200 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                PDF
              </Button>
            </div>
          )}

          <div className="flex gap-2 w-full mt-2 border-t pt-3 border-slate-100 dark:border-slate-800">
            <a 
              href={`/ticket/${qrTicket?.uuid}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1"
            >
              <Button variant="outline" className="w-full gap-1.5 text-xs h-9 cursor-pointer border-slate-250 hover:bg-slate-50">
                <ExternalLink className="h-3.5 w-3.5" />
                Open Page
              </Button>
            </a>
            <Button 
              variant="default" 
              onClick={() => setQrTicket(null)} 
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-9 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden offscreen Ticket render for PDF/PNG download from list */}
      {qrTicket && (
        <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '380px', height: 'auto', zIndex: -100 }}>
          <div 
            ref={ticketRef}
            className="w-[380px] border border-slate-200 bg-white p-5 rounded-2xl text-slate-900 text-left"
          >
            {/* Ticket Banner Image */}
            <div className="w-[calc(100%+2.5rem)] -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl border-b border-slate-100 bg-slate-950 flex justify-center items-center">
              <img 
                src="/ticket.jpg" 
                alt="Event Banner" 
                className="w-full h-auto object-contain block"
              />
            </div>

            <div className="flex flex-col items-center justify-center border-b border-dashed border-slate-200 pb-3.5 text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Payment Confirmed</span>
              <h2 className="text-lg font-bold text-slate-955 mt-0.5">🎫 Entry Pass</h2>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Ticket ID: #{String(qrTicket.id).padStart(5, '0')}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-4 border-b border-dashed border-slate-200 bg-slate-50/50 my-1 rounded-xl">
              <QRCodeCanvas
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ticket/${qrTicket.uuid}`}
                size={140}
                level="H"
                includeMargin={true}
                className="bg-white p-2 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-1.5 font-mono uppercase tracking-wider">
                Scan at Gate for verification
              </span>
            </div>

            <div className="py-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-900">{qrTicket.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="font-mono text-slate-700">{qrTicket.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guests</span>
                <span className="font-semibold text-slate-800">
                  {qrTicket.adults} Adults, {qrTicket.kids} Kids
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-slate-955">${Number(qrTicket.amount_paid).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium">
                  {qrTicket.payment_method}
                </span>
              </div>
              {qrTicket.remarks && (
                <div className="pt-2 border-t border-slate-100 pb-2">
                  <p className="text-xs text-slate-400">Remarks:</p>
                  <p className="text-xs italic text-slate-650 mt-0.5">{qrTicket.remarks}</p>
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-dashed border-slate-200">
              Created: {new Date(qrTicket.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
