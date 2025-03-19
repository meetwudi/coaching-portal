import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: adminProfiles, error } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      return NextResponse.json({ error: "No admin found" }, { status: 404 })
    }

    return NextResponse.json({ id: adminProfiles[0].id })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred while getting admin information" },
      { status: 500 },
    )
  }
}

