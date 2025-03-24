import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import DeleteNoteButton from "@/components/delete-note-button";
import EditNoteButton from "@/components/edit-note-button";

export default async function StudentNotesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // Get all notes for this student
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // For each note, get the admin profile separately
  const notesWithAdmins = await Promise.all(
    (notes || []).map(async (note) => {
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", note.admin_id)
        .single();

      return {
        ...note,
        admin: adminProfile || { first_name: "Unknown", last_name: "Admin" },
        created_by_student: note.created_by_student || false,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
          <p className="text-muted-foreground">
            Notes and feedback between you and your coach
          </p>
        </div>
        <Link href="/student/notes/create">
          <Button>Create Note</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {notesWithAdmins && notesWithAdmins.length > 0 ? (
          notesWithAdmins.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{note.title}</h4>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground mr-4">
                        {formatDate(note.created_at)}
                      </p>
                      {note.created_by_student && (
                        <div className="flex gap-2">
                          <EditNoteButton noteId={note.id} isAdmin={false} />
                          <DeleteNoteButton
                            noteId={note.id}
                            noteTitle={note.title}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-line">{note.content}</p>
                  <div className="flex justify-between items-center">
                    {note.created_by_student ? (
                      <p className="text-xs text-muted-foreground">
                        Sent to: {note.admin?.first_name}{" "}
                        {note.admin?.last_name}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        From: {note.admin?.first_name} {note.admin?.last_name}
                      </p>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        note.created_by_student
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {note.created_by_student ? "Sent by you" : "From coach"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No notes yet.</p>
        )}
      </div>
    </div>
  );
}
