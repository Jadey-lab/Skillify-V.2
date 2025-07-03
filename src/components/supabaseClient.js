// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and anon key
const supabaseUrl = 'https://ytizgpivhcznslzisyhb.supabase.co'; // Your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aXpncGl2aGN6bnNsemlzeWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTY1MjEsImV4cCI6MjA1MjI3MjUyMX0.VogEoAYqNs4mRvXoS5RtEI8evj72tCz-zqz7yDD2xS4'; // Your Supabase Anon Key

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
