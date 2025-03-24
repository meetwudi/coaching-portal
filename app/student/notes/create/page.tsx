import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateNoteForm from "./create-note-form";

export default async function CreateNotePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Get the coach information for this student
  const { data: adminProfiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "admin")
    .limit(1);

  const coach =
    adminProfiles && adminProfiles.length > 0 ? adminProfiles[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Note</h2>
        <p className="text-muted-foreground">Share a note with your coach</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
          <CardDescription>
            {coach
              ? `Send a note to your coach (${coach.first_name} ${coach.last_name})`
              : "Send a note to your coach"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateNoteForm coachId={coach?.id} />
        </CardContent>
      </Card>
    </div>
  );
}
