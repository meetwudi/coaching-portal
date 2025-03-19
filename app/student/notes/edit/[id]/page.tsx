import { notFound, redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EditNoteForm from "./edit-note-form"

interface EditNotePageProps {
  params: {
    id: string
  }
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get the note
  const { data: note, error } = await supabase.from("notes").select("*").eq("id", params.id).single()

  if (!note || error) {
    notFound()
  }

  // Check if the student is the creator of the note
  if (note.user_id !== session.user.id || !note.created_by_student) {
    redirect("/student/notes")
  }

  // Get the coach information
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", note.admin_id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Note</h2>
        <p className="text-muted-foreground">Update your note</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Note</CardTitle>
          <CardDescription>
            {adminProfile
              ? `Update your note to ${adminProfile.first_name} ${adminProfile.last_name}`
              : "Update your note to your coach"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditNoteForm note={note} />
        </CardContent>
      </Card>
    </div>
  )
}

