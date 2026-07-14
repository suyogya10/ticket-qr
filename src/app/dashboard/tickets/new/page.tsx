'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { QRCodeCanvas } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { 
  PlusCircle, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  QrCode, 
  Download, 
  Share2, 
  Phone, 
  Printer 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Validation Schema
const ticketSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  adults: z.number().min(0, 'Cannot be negative'),
  kids: z.number().min(0, 'Cannot be negative'),
  amountPaid: z.number().min(0, 'Cannot be negative'),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  remarks: z.string().optional(),
})

type TicketFormValues = z.infer<typeof ticketSchema>

interface CreatedTicket {
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

export default function NewTicketPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null)
  
  const ticketRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      adults: 1,
      kids: 0,
      paymentMethod: 'CASH',
    },
  })

  // Watch selected value for custom styled components (since react-hook-form register doesn't attach to Select directly)
  const currentPaymentMethod = watch('paymentMethod')

  const onSubmit = async (values: TicketFormValues) => {
    startTransition(async () => {
      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('Authentication expired. Please log in again.')
        router.push('/login')
        return
      }

      // 2. Insert into database
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          full_name: values.fullName,
          phone: values.phone,
          adults: values.adults,
          kids: values.kids,
          amount_paid: values.amountPaid,
          payment_method: values.paymentMethod,
          remarks: values.remarks || null,
          created_by: user.id,
          status: 'VALID',
        })
        .select()
        .single()

      if (error) {
        toast.error(error.message || 'Failed to create ticket')
        return
      }

      // 3. Trigger confetti on success
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      })

      toast.success('Ticket generated successfully!')
      setCreatedTicket(data as CreatedTicket)
      reset() // Reset form values
    })
  }

  // PNG Export
  const downloadPNG = async () => {
    if (!ticketRef.current || !createdTicket) return
    try {
      const html2canvasModule = await import('html2canvas-pro')
      const html2canvasFn = html2canvasModule.default || html2canvasModule
      
      const canvas = await html2canvasFn(ticketRef.current, {
        scale: 2, // improve quality
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      })
      const link = document.createElement('a')
      link.download = `ticket-${String(createdTicket.id).padStart(5, '0')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('PNG downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PNG')
    }
  }

  // PDF Export
  const downloadPDF = async () => {
    if (!ticketRef.current || !createdTicket) return
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
      
      const imgWidth = 148 // base width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight] // Fit page dimensions to the ticket exactly
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`ticket-${String(createdTicket.id).padStart(5, '0')}.pdf`)
      toast.success('PDF downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PDF')
    }
  }

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    if (!createdTicket) return
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://domain.com'
    const verificationUrl = `${origin}/ticket/${createdTicket.uuid}`
    const message = `Hello ${createdTicket.full_name}!\n\nThank you for your payment. Here is your digital entry ticket for the event:\n\n🎫 Ticket ID: #${String(createdTicket.id).padStart(5, '0')}\n- Attendees: ${createdTicket.adults} Adults, ${createdTicket.kids} Kids\n- Paid: $${Number(createdTicket.amount_paid).toFixed(2)}\n\nClick the link below to verify and display your entry QR code at the gate:\n👉 ${verificationUrl}\n\nHave a great time!`
    
    // Format phone number to clean it from spaces, dashes, parentheses
    const cleanPhone = createdTicket.phone.replace(/[^0-9+]/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header and Back navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="inline-flex cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {createdTicket ? 'Ticket Generated' : 'New Ticket'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {createdTicket ? 'Copy QR link or print the ticket confirmation.' : 'Enter guest details and payment confirmation.'}
          </p>
        </div>
      </div>

      {createdTicket ? (
        /* Success & Review Ticket Screen */
        <div className="grid gap-6 md:grid-cols-5">
          {/* Ticket preview card (A5 format receipt style) */}
          <div className="md:col-span-3 flex justify-center">
            <div 
              ref={ticketRef}
              className="w-full max-w-[380px] border border-slate-200 bg-white p-5 shadow-md rounded-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-50 relative overflow-hidden"
            >
              {/* Ticket Banner Image */}
              <div className="w-[calc(100%+2.5rem)] -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl border-b border-slate-100 dark:border-slate-800 bg-slate-950 flex justify-center items-center">
                <img 
                  src="/ticket.jpg" 
                  alt="Event Banner" 
                  className="w-full h-auto object-contain block"
                />
              </div>

              {/* Clinical design pattern with dotted separation */}
              <div className="flex flex-col items-center justify-center border-b border-dashed border-slate-200 pb-3.5 text-center dark:border-slate-800">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 mb-1.5" />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Payment Confirmed</span>
                <h2 className="text-lg font-bold text-slate-955 dark:text-slate-50 mt-0.5">🎫 Entry Pass</h2>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  Ticket ID: #{String(createdTicket.id).padStart(5, '0')}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center py-4 border-b border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 my-1 rounded-xl">
                <QRCodeCanvas
                  value={`${typeof window !== 'undefined' ? window.location.origin : 'https://domain.com'}/ticket/${createdTicket.uuid}`}
                  size={140}
                  level="H"
                  includeMargin={true}
                  className="bg-white p-2 rounded-lg border border-slate-100"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-505 mt-1.5 font-mono uppercase tracking-wider">
                  Scan at Gate for verification
                </span>
              </div>

              {/* Ticket Details */}
              <div className="py-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{createdTicket.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-mono text-slate-700 dark:text-slate-350">{createdTicket.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guests</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {createdTicket.adults} Adults, {createdTicket.kids} Kids
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-bold text-slate-955 dark:text-slate-50">${Number(createdTicket.amount_paid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">
                    {createdTicket.payment_method}
                  </span>
                </div>
                {createdTicket.remarks && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 pb-3">
                    <p className="text-xs text-slate-400">Remarks:</p>
                    <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-0.5">{createdTicket.remarks}</p>
                  </div>
                )}
              </div>

              {/* Footer Stamp */}
              <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800">
                Created: {new Date(createdTicket.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action buttons on the right side */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-md">Actions</CardTitle>
                <CardDescription>Share or download the ticket</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={downloadPNG} 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-11 border-slate-250 hover:bg-slate-50 cursor-pointer"
                >
                  <Download className="h-5 w-5 text-slate-500" />
                  Download PNG Image
                </Button>
                
                <Button 
                  onClick={downloadPDF} 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-11 border-slate-250 hover:bg-slate-50 cursor-pointer"
                >
                  <Printer className="h-5 w-5 text-slate-500" />
                  Download PDF Receipt
                </Button>

                <Button 
                  onClick={handleWhatsAppShare}
                  className="w-full justify-start gap-3 h-11 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <Phone className="h-5 w-5 fill-current" />
                  Send via WhatsApp
                </Button>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">Verification Link:</span>
                <code className="text-[10px] bg-slate-100 dark:bg-slate-800 p-2 rounded block w-full overflow-x-auto select-all font-mono whitespace-nowrap text-slate-800 dark:text-slate-350">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://domain.com'}/ticket/{createdTicket.uuid}
                </code>
              </CardFooter>
            </Card>

            <Button 
              onClick={() => setCreatedTicket(null)} 
              className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
            >
              Generate Another Ticket
            </Button>
          </div>
        </div>
      ) : (
        /* Form Screen */
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-slate-200/80 shadow-xs dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Ticket Registration</CardTitle>
              <CardDescription>Enter payment and attendance details</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {/* Guest Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Guest First & Last Name"
                    disabled={isPending}
                    className={`h-10 border-slate-200 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (with Country Code)</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +1234567890"
                    type="tel"
                    disabled={isPending}
                    className={`h-10 border-slate-200 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Attendees Counts */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adults">Adults Count</Label>
                    <Input
                      id="adults"
                      type="number"
                      min="0"
                      disabled={isPending}
                      className={`h-10 border-slate-200 focus-visible:ring-cyan-500 ${errors.adults ? 'border-red-500' : ''}`}
                      {...register('adults', { valueAsNumber: true })}
                    />
                    {errors.adults && (
                      <p className="text-red-500 text-xs font-medium mt-1">{errors.adults.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="kids">Kids Count</Label>
                    <Input
                      id="kids"
                      type="number"
                      min="0"
                      disabled={isPending}
                      className={`h-10 border-slate-200 focus-visible:ring-cyan-500 ${errors.kids ? 'border-red-500' : ''}`}
                      {...register('kids', { valueAsNumber: true })}
                    />
                    {errors.kids && (
                      <p className="text-red-500 text-xs font-medium mt-1">{errors.kids.message}</p>
                    )}
                  </div>
                </div>

                {/* Payment Fields */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount Paid ($)</Label>
                    <Input
                      id="amountPaid"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isPending}
                      className={`h-10 border-slate-200 focus-visible:ring-cyan-500 ${errors.amountPaid ? 'border-red-500' : ''}`}
                      {...register('amountPaid', { valueAsNumber: true })}
                    />
                    {errors.amountPaid && (
                      <p className="text-red-500 text-xs font-medium mt-1">{errors.amountPaid.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      disabled={isPending}
                      value={currentPaymentMethod}
                      onValueChange={(val) => setValue('paymentMethod', val || '')}
                    >
                      <SelectTrigger className="h-10 border-slate-200">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card / POS</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="ONLINE_WALLET">Online Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Input
                    id="remarks"
                    placeholder="e.g. VIP seating, dietary notes"
                    disabled={isPending}
                    className="h-10 border-slate-200 focus-visible:ring-cyan-500"
                    {...register('remarks')}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 p-6 dark:border-slate-800">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium cursor-pointer shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Ticket...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Generate Ticket Pass
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Guidelines Sidebar info */}
          <div className="space-y-6">
            <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-md">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400 space-y-3 leading-relaxed">
                <p>
                  <strong>Internal Use Only:</strong> Guests cannot register themselves. Only authenticated event staff may generate tickets.
                </p>
                <p>
                  <strong>QR Content Security:</strong> The generated QR code contains ONLY the public verification URL. Personal data is never stored in the barcode to respect visitor privacy.
                </p>
                <p>
                  <strong>Confirmation:</strong> Upon creation, a unique entry pass is generated with a cryptographic UUID. Guests can scan their pass to open their live gate ticket.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
