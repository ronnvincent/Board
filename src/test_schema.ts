import fetch from 'node-fetch';

async function run() {
  const base = "https://mfypampschkhqnjrzsov.supabase.co/rest/v1";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meXBhbXBzY2hraHFuanJ6c292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjczMjYsImV4cCI6MjA5OTYwMzMyNn0.6RTUxJbpBWeJOgq3RdbnPMakwTulL1ksVDnHs8usNsU";
  const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Accept": "application/json"
  };
  
  // Get one row from maintenance_requests to see actual columns and values
  const res = await fetch(`${base}/maintenance_requests?limit=5&order=created_at.desc`, { headers });
  const data = await res.json();
  console.log("maintenance_requests sample rows:");
  console.log(JSON.stringify(data, null, 2));
  
  // Also try the OpenAPI schema with trailing slash
  const schemaRes = await fetch(`${base}/`, {
    headers: { ...headers, "Accept": "application/openapi+json" }
  });
  const schemaData = await schemaRes.json();
  const defs = schemaData.definitions;
  if (defs && defs.maintenance_requests) {
    console.log("\n\nOpenAPI maintenance_requests definition:");
    console.log(JSON.stringify(defs.maintenance_requests, null, 2));
  }
}
run();
