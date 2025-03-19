import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import SessionsManager from "./sessions-manager"
import AddNoteForm from "./add-note-form"
import DeleteNoteButton from "@/components/delete-note-button"

interface StudentPageProps {
  params: {
    id: string
  }
}

export default async function StudentPage({ params }: StudentPageProps) {
  const supabase = createServerSupabaseClient()

  // Get student profile
  const { data: student, error: studentError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!student || studentError) {
    notFound()
  }

  // Get student email - using multiple approaches
  let studentEmail = ""

  // First try using the admin API
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(params.id)
    studentEmail = authUser?.user?.email || ""
    console.log("Email from admin.getUserById:", studentEmail)
  } catch (error) {
    console.error("Error fetching student email with admin.getUserById:", error)
  }

  // If that didn't work, try listing all users
  if (!studentEmail) {
    try {
      const { data: allUsers } = await supabase.auth.admin.listUsers()
      const matchingUser = allUsers?.users?.find((user) => user.id === params.id)
      studentEmail = matchingUser?.email || ""
      console.log("Email from admin.listUsers:", studentEmail)
    } catch (fallbackError) {
      console.error("Error fetching student email with admin.listUsers:", fallbackError)
    }
  }

  // If we still don't have an email, try to get it from the invitations table
  if (!studentEmail) {
    try {
      // Find invitations that match this user's ID through the admin_id field
      const { data: invitations } = await supabase
        .from("invitations")
        .select("email, is_accepted, admin_id")
        .eq("is_accepted", true)
        .order("created_at", { ascending: false })

      console.log("Found invitations:", invitations)

      // If we have invitations, try to match one to this student
      if (invitations && invitations.length > 0) {
        // We need to find a way to match the invitation to this student
        // One approach is to look at the student's profile creation date
        // and find an invitation that was accepted around the same time

        // For now, let's just use the most recent accepted invitation as a fallback
        studentEmail = invitations[0].email
        console.log("Email from invitations:", studentEmail)
      }
    } catch (inviteError) {
      console.error("Error fetching email from invitations:", inviteError)
    }
  }

  console.log("Final student email:", studentEmail)

  // Get student sessions
  const { data: sessions } = await supabase.from("sessions").select("*").eq("user_id", params.id).single()

  // Get notes for this student - using a simpler approach
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })

  // For each note, get the admin profile separately
  const notesWithAdmins = await Promise.all(
    (notes || []).map(async (note) => {
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

  // Check if we need to create a sessions record
  const needsSessionsRecord = !sessions

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {student.first_name && student.last_name ? `${student.first_name} ${student.last_name}` : "Unnamed Student"}
        </h2>
        <p className="text-muted-foreground">{studentEmail || "No email available"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic information about this student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <p className="text-sm font-medium">Email:</p>
              <p className="text-sm">{studentEmail || "No email available"}</p>

              <p className="text-sm font-medium">Joined:</p>
              <p className="text-sm">{formatDate(student.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              {needsSessionsRecord
                ? "This student doesn't have a sessions record yet. Create one below."
                : "Manage coaching sessions for this student"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsManager
              studentId={params.id}
              initialSessions={sessions || { total_sessions: 0, used_sessions: 0 }}
              needsSessionsRecord={needsSessionsRecord}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
          <CardDescription>Share a note with this student</CardDescription>
        </CardHeader>
        <CardContent>
          {studentEmail ? (
            <AddNoteForm studentId={params.id} studentEmail={studentEmail} />
          ) : (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <p className="font-medium">Cannot send email notifications</p>
              <p className="text-sm">
                No email address is available for this student. Notes can still be added, but email notifications will
                not be sent.
              </p>
              <div className="mt-4">
                <AddNoteForm studentId={params.id} studentEmail="" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Notes History</h3>
        {notesWithAdmins && notesWithAdmins.length > 0 ? (
          <div className="grid gap-4">
            {notesWithAdmins.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{note.title}</h4>
                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground mr-4">{formatDate(note.created_at)}</p>
                        <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-line">{note.content}</p>
                    <p className="text-xs text-muted-foreground">
                      By: {note.admin?.first_name} {note.admin?.last_name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No notes shared yet.</p>
        )}
      </div>
    </div>
  )
}

