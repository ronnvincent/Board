import fetch from 'node-fetch';

async function run() {
  const url = "https://mfypampschkhqnjrzsov.supabase.co/rest/v1/";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meXBhbXBzY2hraHFuanJ6c292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjczMjYsImV4cCI6MjA5OTYwMzMyNn0.6RTUxJbpBWeJOgq3RdbnPMakwTulL1ksVDnHs8usNsU";
  
  const res = await fetch(url, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Accept": "application/openapi+json"
    }
  });
  const data = await res.json();
  const defs = data.definitions || data.components?.schemas;
  if (!defs) {
    console.log("No schemas found", Object.keys(data));
    return;
  }
  
  if (defs.profiles) {
    console.log("Profiles cols:", Object.keys(defs.profiles.properties));
  } else {
    console.log("Profiles table not found in schema");
  }
}
run();
