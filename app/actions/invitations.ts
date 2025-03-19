"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateToken } from "@/lib/utils"
import type { Database } from "@/lib/database.types"

export async function createInvitation(email: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Get current user (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("You must be logged in to invite students")
    }

    // Generate unique token for invitation
    const token = generateToken()

    // Create invitation record
    const { error } = await supabase.from("invitations").insert({
      email,
      token,
      admin_id: user.id,
      is_accepted: false,
    })

    if (error) {
      throw error
    }

    return { success: true, token, adminId: user.id }
  } catch (error: any) {
    console.error("Invitation error:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteInvitation(invitationId: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    const { error } = await supabase.from("invitations").delete().eq("id", invitationId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Delete invitation error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateInvitationDates(invitationId: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Update the invitation's created_at and expires_at dates
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const { error } = await supabase
      .from("invitations")
      .update({
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", invitationId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Update invitation dates error:", error)
    return { success: false, error: error.message }
  }
}

