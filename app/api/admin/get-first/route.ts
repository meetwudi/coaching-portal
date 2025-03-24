import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: adminProfiles, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      return NextResponse.json({ error: "No admin found" }, { status: 404 });
    }

    return NextResponse.json({ id: adminProfiles[0].id });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message || "An error occurred while getting admin information",
      },
      { status: 500 }
    );
  }
}
