import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "../app/types/auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// We export a dummy client if keys are missing, so the app doesn't immediately crash,
// but we'll handle the missing keys gracefully in AuthContext.
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
