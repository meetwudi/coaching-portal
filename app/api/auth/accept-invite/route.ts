import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, token } = await request.json()

    if (!email || !password || !firstName || !lastName || !token) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      role: "student",
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Create initial sessions record
    const { error: sessionsError } = await supabase.from("sessions").insert({
      user_id: authData.user.id,
      total_sessions: 0,
      used_sessions: 0,
    })

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 })
    }

    // Mark invitation as accepted
    const { error: inviteError } = await supabase.from("invitations").update({ is_accepted: true }).eq("token", token)

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    // Check if email confirmation is required
    const emailVerified = authData.user.identities?.[0]?.identity_data?.email_verified === true

    return NextResponse.json({
      success: true,
      emailVerified,
      user: authData.user,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred during invitation acceptance" },
      { status: 500 },
    )
  }
}

