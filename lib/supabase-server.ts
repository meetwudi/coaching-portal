import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>(
    { cookies: () => cookieStore },
    {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
    }
  );
};
