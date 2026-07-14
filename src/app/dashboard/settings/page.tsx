import { Settings, Shield, Server, HelpCircle, Key } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage system configurations and view operational settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400 mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold">Security Settings</CardTitle>
            <CardDescription>Row Level Security and user configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Row Level Security (RLS) is currently <strong className="text-emerald-600">ENABLED</strong> on the tickets table. Public requests cannot list or fetch tickets except through the secure database RPC function.
            </p>
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Database Policies:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authenticated staff: Full access (All CRUD operations)</li>
                <li>Anonymous public: Exec RPC `get_public_ticket` by UUID</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400 mb-2">
              <Server className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold">Supabase Configuration</CardTitle>
            <CardDescription>Connected backend project references</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-650 dark:text-slate-405">
            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-medium text-slate-500">Project reference</span>
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                  kxzewgjizzkqnvqrtumo
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-medium text-slate-500">API connection status</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full inline-block" /> Active
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-medium text-slate-500">Auth provider</span>
                <span className="text-slate-800 dark:text-slate-200">Supabase Auth (JWT)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 border-slate-200/80 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Help & Instructions</CardTitle>
              <CardDescription>Operational guide for ticket managers</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              To check in guest tickets at an event, direct the attendee to present their QR code (either on paper or their phone screen). Use any smartphone camera to scan the code. This will open the verification page:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Verify Badge</strong>: A green badge indicates a <strong className="text-emerald-600">VALID</strong> ticket.</li>
              <li><strong>Check Attendance</strong>: Verify the number of Adults and Kids matches the party present.</li>
              <li><strong>Scan & Change Status</strong>: If check-in scanner support is activated, the ticket status will change to <strong className="text-amber-600">USED</strong> to prevent double entries.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
