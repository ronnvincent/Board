import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://mfypampschkhqnjrzsov.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: houses } = await supabase.from("houses").select("*");
  if (!houses || houses.length === 0) return;
  const houseId = houses[0].id;

  const roomInserts = Array.from({ length: 10 }).map((_, i) => ({
    house_id: houseId,
    number: `${i + 101}`,
    status: "vacant",
    price: 5000,
    features: ["Wi-Fi", "AC"]
  }));
  
  console.log("Attempting to insert 10 rooms...");
  const { error } = await supabase.from("rooms").insert(roomInserts);
  console.log("Insert Error:", error);
}
run();
