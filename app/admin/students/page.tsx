import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export default async function StudentsPage() {
  const supabase = createServerSupabaseClient()

  // First, let's check all profiles with role=student
  const { data: studentProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")

  // Get all students with their session counts - using a different approach
  const { data: students, error: studentsError } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      created_at,
      role
    `)
    .eq("role", "student")
    .order("created_at", { ascending: false })

  // If we have students, let's get their emails and sessions separately
  let studentsWithData = []

  if (students && students.length > 0) {
    // Create an array to hold the enhanced student data
    studentsWithData = await Promise.all(
      students.map(async (student) => {
        // Try multiple approaches to get the user email
        let email = "No email found"
        
        // First try using the admin API
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(student.id)
          if (authUser?.user?.email) {
            email = authUser.user.email
          }
        } catch (error) {
          console.error("Error fetching email with admin.getUserById:", error)
        }

        // If that didn't work, try to get it from invitations
        if (email === "No email found") {
          try {
            const { data: invitation } = await supabase
              .from("invitations")
              .select("email")
              .eq("is_accepted", true)
              .order("created_at", { ascending: false })
              .limit(1)
              .single()

            if (invitation?.email) {
              email = invitation.email
            }
          } catch (inviteError) {
            console.error("Error fetching email from invitations:", inviteError)
          }
        }

        // Get the sessions data
        const { data: sessionData } = await supabase
          .from("sessions")
          .select("total_sessions, used_sessions")
          .eq("user_id", student.id)
          .single()

        // Return the combined data
        return {
          ...student,
          email,
          sessions: sessionData || { total_sessions: 0, used_sessions: 0 },
        }
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage your coaching students and their sessions</p>
        </div>
        <Link href="/admin/invitations">
          <Button>Invite Student</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {studentsWithData && studentsWithData.length > 0 ? (
          studentsWithData.map((student: any) => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {student.first_name && student.last_name
                        ? `${student.first_name} ${student.last_name}`
                        : "Unnamed Student"}
                    </p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <p className="text-sm text-muted-foreground">Joined: {formatDate(student.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        {student.sessions
                          ? `${student.sessions.used_sessions || 0} / ${student.sessions.total_sessions || 0}`
                          : "0 / 0"}
                      </p>
                    </div>
                    <Link href={`/admin/students/${student.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No students found.</p>
        )}
      </div>
    </div>
  )
}

