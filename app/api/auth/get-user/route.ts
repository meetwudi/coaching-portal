import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: error?.message || "User not found" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      role: profile?.role,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message || "An error occurred while getting user information",
      },
      { status: 500 }
    );
  }
}
