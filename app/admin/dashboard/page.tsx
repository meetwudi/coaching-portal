import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText, Mail } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient()

  // Get counts for dashboard
  const { count: studentsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: notesCount } = await supabase.from("notes").select("*", { count: "exact", head: true })

  const { count: invitationsCount } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true })
    .eq("is_accepted", false)

  // Get the sum of total_sessions across all sessions records
  const { data: sessionsData, error: sessionsError } = await supabase.from("sessions").select("total_sessions")

  // Calculate the total sessions allocated
  const totalSessionsAllocated = sessionsData
    ? sessionsData.reduce((sum, session) => sum + (session.total_sessions || 0), 0)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your coaching business</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active coaching students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessionsAllocated}</div>
            <p className="text-xs text-muted-foreground">Coaching sessions allocated</p>
            {sessionsError && <p className="text-xs text-red-500 mt-1">Error: {sessionsError.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes Shared</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Notes shared with students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitationsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Invitations awaiting acceptance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

