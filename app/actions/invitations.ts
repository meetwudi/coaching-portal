"use server";

import { generateToken } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function createInvitation(email: string) {
  try {
    const supabase = createServerSupabaseClient();

    // Get current user (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to invite students");
    }

    // Generate unique token for invitation
    const token = generateToken();

    // Create invitation record
    const { error } = await supabase.from("invitations").insert({
      email,
      token,
      admin_id: user.id,
      is_accepted: false,
    });

    if (error) {
      throw error;
    }

    return { success: true, token, adminId: user.id };
  } catch (error: any) {
    console.error("Invitation error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteInvitation(invitationId: string) {
  try {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete invitation error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInvitationDates(invitationId: string) {
  try {
    const supabase = createServerSupabaseClient();

    // Update the invitation's created_at and expires_at dates
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const { error } = await supabase
      .from("invitations")
      .update({
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", invitationId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Update invitation dates error:", error);
    return { success: false, error: error.message };
  }
}
