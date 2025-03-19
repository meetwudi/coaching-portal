import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { profiles, public_sessions } from "@prisma/client";

type StudentWithRelations = profiles & {
  users: {
    email: string | null;
    coaching_sessions: Pick<
      public_sessions,
      "total_sessions" | "used_sessions"
    >[];
  } | null;
};

export default async function StudentsPage() {
  // Get all students with their user data and sessions
  const students = (await prisma.profiles.findMany({
    where: {
      role: "student",
    },
    include: {
      users: {
        select: {
          email: true,
          coaching_sessions: {
            select: {
              total_sessions: true,
              used_sessions: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  })) as StudentWithRelations[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage your coaching students and their sessions
          </p>
        </div>
        <Link href="/admin/invitations">
          <Button>Invite Student</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {students && students.length > 0 ? (
          students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {student.first_name && student.last_name
                        ? `${student.first_name} ${student.last_name}`
                        : "Unnamed Student"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.users?.email || "No email found"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined:{" "}
                      {student.created_at
                        ? formatDate(student.created_at)
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        {student.users?.coaching_sessions?.[0]
                          ? `${
                              student.users.coaching_sessions[0]
                                .used_sessions || 0
                            } / ${
                              student.users.coaching_sessions[0]
                                .total_sessions || 0
                            }`
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
  );
}
