import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import DeleteNoteButton from "@/components/delete-note-button"
import EditNoteButton from "@/components/edit-note-button"

export default async function NotesPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get all notes with admin and student information
  const { data: notes } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

  // For each note, get the admin and student profiles separately
  const notesWithProfiles = await Promise.all(
    (notes || []).map(async (note) => {
      // Get admin profile
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", note.admin_id)
        .single()

      // Get student profile
      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", note.user_id)
        .single()

      return {
        ...note,
        admin: adminProfile || { first_name: "Unknown", last_name: "Admin" },
        student: studentProfile || { first_name: "Unknown", last_name: "Student" },
        created_by_student: note.created_by_student || false,
        can_edit: note.admin_id === session.user.id && !note.created_by_student,
      }
    }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
        <p className="text-muted-foreground">View all notes shared with your students</p>
      </div>

      <div className="grid gap-4">
        {notesWithProfiles && notesWithProfiles.length > 0 ? (
          notesWithProfiles.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{note.title}</h4>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground mr-4">{formatDate(note.created_at)}</p>
                      {note.can_edit && <EditNoteButton noteId={note.id} isAdmin={true} />}
                      <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-line">{note.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <p>
                      {note.created_by_student ? "From" : "To"}: {note.student?.first_name} {note.student?.last_name}
                    </p>
                    {!note.created_by_student && (
                      <p>
                        By: {note.admin?.first_name} {note.admin?.last_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        note.created_by_student ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {note.created_by_student ? "From student" : "From coach"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No notes found.</p>
        )}
      </div>
    </div>
  )
}

