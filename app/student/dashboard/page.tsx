import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, FileText } from "lucide-react"

export default async function StudentDashboard() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get student profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get student sessions
  const { data: sessions } = await supabase.from("sessions").select("*").eq("user_id", session.user.id).single()

  // Get notes count
  const { count: notesCount } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)

  // Get recent notes
  const { data: recentNotes } = await supabase
    .from("notes")
    .select(`
      *
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  // For each note, get the admin profile separately
  const recentNotesWithAdmins = await Promise.all(
    (recentNotes || []).map(async (note) => {
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", note.admin_id)
        .single()

      return {
        ...note,
        admin: adminProfile || { first_name: "Unknown", last_name: "Admin" },
      }
    }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {profile?.first_name || "Student"}</h2>
        <p className="text-muted-foreground">Here's an overview of your coaching progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coaching Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">
              {sessions ? `${sessions.used_sessions} / ${sessions.total_sessions}` : "0 / 0"}
            </div>
            <Progress value={sessions ? (sessions.used_sessions / sessions.total_sessions) * 100 : 0} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {sessions && sessions.total_sessions > 0
                ? `${Math.round((sessions.used_sessions / sessions.total_sessions) * 100)}% of your sessions used`
                : "No sessions allocated yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notesCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {notesCount && notesCount > 0 ? "Notes from your coach" : "No notes yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Notes</h3>
        {recentNotesWithAdmins && recentNotesWithAdmins.length > 0 ? (
          <div className="grid gap-4">
            {recentNotesWithAdmins.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{note.title}</h4>
                      <p className="text-sm text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm line-clamp-2">{note.content}</p>
                    <p className="text-xs text-muted-foreground">
                      From: {note.admin?.first_name} {note.admin?.last_name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No notes from your coach yet.</p>
        )}
      </div>
    </div>
  )
}

