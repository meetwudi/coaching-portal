"use server";

import { createActionSupabaseClient } from "@/lib/supabase-server";

export async function createNote(
  userId: string,
  adminId: string,
  title: string,
  content: string,
  createdByStudent = false
) {
  try {
    const supabase = createActionSupabaseClient();

    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        admin_id: adminId,
        title,
        content,
        is_read: false,
        created_by_student: createdByStudent,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, note };
  } catch (error: any) {
    console.error("Create note error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateNote(
  noteId: string,
  title: string,
  content: string
) {
  try {
    const supabase = createActionSupabaseClient();

    const { error } = await supabase
      .from("notes")
      .update({
        title,
        content,
      })
      .eq("id", noteId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Update note error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteNote(noteId: string) {
  try {
    const supabase = createActionSupabaseClient();

    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete note error:", error);
    return { success: false, error: error.message };
  }
}
