// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-id.supabase.co';  // Replace with your Supabase URL
const supabaseKey = 'your-anon-key';  // Replace with your Supabase anon/public key

export const supabase = createClient(supabaseUrl, supabaseKey);
