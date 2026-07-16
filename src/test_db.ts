import { createClient } from "@supabase/supabase-js";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Set ${name} before running this script.`);
  }
  return value;
};

const supabaseUrl = requireEnv("VITE_SUPABASE_URL");
const supabaseKey = requireEnv("VITE_SUPABASE_ANON_KEY");

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
