import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import InviteStudentForm from "./invite-student-form";
import DeleteInvitationButton from "@/components/delete-invitation-button";
import ResendInvitationButton from "@/components/resend-invitation-button";

export default async function InvitationsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invitations</h2>
          <p className="text-muted-foreground">
            Manage student invitations to your coaching platform
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite a New Student</CardTitle>
          <CardDescription>
            Send an email invitation to a new student to join your coaching
            platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteStudentForm />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Invitations</h3>
        {invitations && invitations.length > 0 ? (
          <div className="grid gap-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited: {formatDate(invitation.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {formatDate(invitation.expires_at)}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Link
                          href={`/invite/${invitation.token}`}
                          target="_blank"
                        >
                          <Button variant="outline" size="sm">
                            Test Link
                          </Button>
                        </Link>
                        {!invitation.is_accepted && (
                          <ResendInvitationButton
                            invitationId={invitation.id}
                            email={invitation.email}
                            token={invitation.token}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          invitation.is_accepted
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {invitation.is_accepted ? "Accepted" : "Pending"}
                      </span>
                      {!invitation.is_accepted && (
                        <DeleteInvitationButton
                          invitationId={invitation.id}
                          email={invitation.email}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No invitations sent yet.</p>
        )}
      </div>
    </div>
  );
}
