import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InviteAcceptForm from "./invite-accept-form";

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const supabase = await createSupabaseServerClient();

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    redirect("/");
  }

  // Get invitation by token
  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", params.token)
    .single();

  if (!invitation) {
    notFound();
  }

  // Check if invitation is expired
  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);

  if (now > expiresAt || invitation.is_accepted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation has expired or has already been used.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join the Career Coaching Portal. Create your
            account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteAcceptForm token={params.token} email={invitation.email} />
        </CardContent>
      </Card>
    </div>
  );
}
