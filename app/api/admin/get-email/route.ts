import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get admin user
    const { data: authUser, error } = await supabase.auth.admin.getUserById(id)

    if (error || !authUser?.user?.email) {
      return NextResponse.json({ error: error?.message || "Admin email not found" }, { status: 404 })
    }

    return NextResponse.json({ email: authUser.user.email })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred while getting admin email" }, { status: 500 })
  }
}

