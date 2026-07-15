import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfypampschkhqnjrzsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meXBhbXBzY2hraHFuanJ6c292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjczMjYsImV4cCI6MjA5OTYwMzMyNn0.6RTUxJbpBWeJOgq3RdbnPMakwTulL1ksVDnHs8usNsU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Checking profiles table...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("Profiles Table Error:", error);
  } else {
    console.log("Profiles Table OK:", data);
  }

  console.log("\nAttempting a dummy signup to see the exact error...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test_dummy_123@example.com',
    password: 'password123',
    options: { data: { full_name: 'Test Dummy' } }
  });

  if (authError) {
    console.error("Auth Error Object:", authError);
    console.error("Auth Error Message:", authError.message);
    console.error("Auth Error Name:", authError.name);
    console.error("Auth Error Status:", authError.status);
  } else {
    console.log("Auth OK:", authData);
  }
}

testConnection();
