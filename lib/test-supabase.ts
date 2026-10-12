
import { createClient } from "./supabase";

export async function testSupabaseConnection() {
  const supabase = createClient();

  const { error } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase connection test failed:", error.message);
    return false;
  }

  console.log("Supabase client connected successfully.");
  return true;
}
