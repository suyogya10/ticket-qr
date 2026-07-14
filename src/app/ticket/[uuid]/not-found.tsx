import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function TicketNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950/20">
      <div className="w-full max-w-md">
        <Card className="border-red-200/80 shadow-xl overflow-hidden rounded-2xl dark:border-red-950/30">
          <CardHeader className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-800 text-center border-b border-red-100 dark:bg-red-950/15 dark:text-red-400 dark:border-red-900/20">
            <ShieldAlert className="h-12 w-12 mb-3" />
            <CardTitle className="text-xl font-bold tracking-tight">Ticket Not Found</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900">
            <p className="text-sm leading-relaxed">
              The ticket pass UUID you scanned could not be located in our database. It may have been permanently deleted, or the verification URL is incorrect.
            </p>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900/40 text-slate-500 font-mono text-center">
              Please double check the QR link.
            </div>
          </CardContent>
          <CardFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent flex justify-center">
            <Link href="/" className="inline-flex">
              <Button variant="ghost" className="gap-2 text-slate-650 hover:bg-slate-100 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Go to Portal
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
