"use server";

import { createActionSupabaseClient } from "@/lib/supabase-server";

export async function updateSessions(
  sessionId: string,
  totalSessions: number,
  usedSessions: number
) {
  try {
    const supabase = createActionSupabaseClient();

    const { error } = await supabase
      .from("sessions")
      .update({
        total_sessions: totalSessions,
        used_sessions: usedSessions,
      })
      .eq("id", sessionId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Update sessions error:", error);
    return { success: false, error: error.message };
  }
}

export async function createSessions(
  studentId: string,
  totalSessions: number,
  usedSessions: number
) {
  try {
    const supabase = createActionSupabaseClient();

    const { error } = await supabase.from("sessions").insert({
      user_id: studentId,
      total_sessions: totalSessions,
      used_sessions: usedSessions,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Create sessions error:", error);
    return { success: false, error: error.message };
  }
}
