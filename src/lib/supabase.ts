import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "../app/types/auth";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase Environment Variables! Make sure to create a .env.local file and restart your dev server."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseKey || "placeholder-key"
);

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  created_at: string;
};
