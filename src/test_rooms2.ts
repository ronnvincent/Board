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
  const { data: houses, error: housesError } = await supabase.from("houses").select("*");
  if (housesError) throw housesError;
  if (!houses || houses.length === 0) return;

  const houseId = houses[0].id;
  const roomInserts = Array.from({ length: 10 }).map((_, i) => ({
    house_id: houseId,
    number: `${i + 101}`,
    status: "vacant",
    price: 5000,
    features: ["Wi-Fi", "AC"],
  }));

  console.log("Attempting to insert 10 rooms...");
  const { error } = await supabase.from("rooms").insert(roomInserts);
  console.log("Insert Error:", error);
}

run();
