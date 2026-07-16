const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Set ${name} before running this script.`);
  }
  return value;
};

const supabaseUrl = requireEnv("VITE_SUPABASE_URL");
const supabaseKey = requireEnv("VITE_SUPABASE_ANON_KEY");

async function run() {
  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: "application/json",
  };

  const res = await fetch(`${base}/maintenance_requests?limit=5&order=created_at.desc`, { headers });
  const data = await res.json();
  console.log("maintenance_requests sample rows:");
  console.log(JSON.stringify(data, null, 2));

  const schemaRes = await fetch(`${base}/`, {
    headers: { ...headers, Accept: "application/openapi+json" },
  });
  const schemaData = await schemaRes.json();
  const defs = schemaData.definitions;
  if (defs?.maintenance_requests) {
    console.log("\n\nOpenAPI maintenance_requests definition:");
    console.log(JSON.stringify(defs.maintenance_requests, null, 2));
  }
}

run();
