import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EditNoteForm from "./edit-note-form";

interface EditNotePageProps {
  params: {
    id: string;
  };
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Get the note
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!note || error) {
    notFound();
  }

  // Check if the admin is the creator of the note
  if (note.admin_id !== session.user.id || note.created_by_student) {
    redirect("/admin/notes");
  }

  // Get the student information
  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", note.user_id)
    .single();

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
            {studentProfile
              ? `Update your note to ${studentProfile.first_name} ${studentProfile.last_name}`
              : "Update your note to the student"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditNoteForm note={note} studentEmail={studentProfile?.email} />
        </CardContent>
      </Card>
    </div>
  );
}
