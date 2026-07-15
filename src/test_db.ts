import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://mfypampschkhqnjrzsov.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meXBhbXBzY2hraHFuanJ6c292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNTAzMTgsImV4cCI6MjEwMDAxNzUxOH0.1rL5y62J4sT2uHhM1-n1d2sLqD3-kX1nQJ4vWn5Q";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles, error: fetchError } = await supabase.from("profiles").select("*");
  if (fetchError) console.error("Fetch error:", fetchError);
  console.log("Profiles:", profiles);
  if (profiles) {
    for (const p of profiles) {
      if (p.role === "resident") {
        console.log(`Fixing profile ${p.id}...`);
        const { error } = await supabase.from("profiles").update({ role: "user" }).eq("id", p.id);
        if (error) console.error("Update error:", error);
      }
    }
  }
}
run();
