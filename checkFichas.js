import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjxgmzdfwmvqyqxlcoil.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_viRV51M_c5nXvH75faY82g_yGd8I2_Z';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("Fetching all fichas...");
  const { data: fichas, error } = await supabase.from('fichas_medicas').select('*').order('created_at', { ascending: false }).limit(5);
  if (error) {
    console.error("Error fetching fichas:", error);
  } else {
    console.log("Fichas:", JSON.stringify(fichas, null, 2));
  }
}

run();
