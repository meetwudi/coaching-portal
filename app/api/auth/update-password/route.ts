import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get user profile to determine redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      role: profile?.role || "student",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred during password update" },
      { status: 500 }
    );
  }
}
