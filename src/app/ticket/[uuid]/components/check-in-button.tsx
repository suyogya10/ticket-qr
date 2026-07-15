'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'

interface CheckInButtonProps {
  ticketId: number
}

export default function CheckInButton({ ticketId }: CheckInButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'USED' })
        .eq('id', ticketId)

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Check-in successful!')
      setIsSuccess(true)
      
      // Update Server Component state instantly via router refresh
      router.refresh()
      
      // Reload page state to update indicators
      setTimeout(() => {
        window.location.reload()
      }, 600)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update ticket status')
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full mt-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-1.5 animate-pulse">
        <Check className="h-4 w-4" />
        Checked In!
      </div>
    )
  }

  return (
    <Button
      onClick={handleCheckIn}
      disabled={loading}
      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-xl mt-4 cursor-pointer flex items-center justify-center shadow-xs transition-colors duration-200"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Check-in...
        </>
      ) : (
        '🎟️ Check In / Mark as Used'
      )}
    </Button>
  )
}
