import { createApiSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";

export async function POST() {
  try {
    const supabase = createApiSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred during logout" },
      { status: 500 }
    );
  }
}
