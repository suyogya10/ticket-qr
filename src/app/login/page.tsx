'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { QrCode, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Invalid login credentials.')
        return
      }

      toast.success('Signed in successfully!')
      // Refresh the router to update the middleware state, then push
      router.refresh()
      router.push('/dashboard')
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950/20">
      <div className="w-full max-w-md">
        {/* Header Logo/Text */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20">
            <QrCode className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            QR Ticket Portal
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Internal Staff Payment & Verification Access
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-lg shadow-slate-100/50 dark:border-slate-800 dark:shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">Sign in to workspace</CardTitle>
            <CardDescription>
              Enter your credentials to manage tickets and payments
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                  autoComplete="email"
                  className="h-10 border-slate-200 focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  autoComplete="current-password"
                  className="h-10 border-slate-200 focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-10 bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-sm transition-colors duration-200"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
