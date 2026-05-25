import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pjxgmzdfwmvqyqxlcoil.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_viRV51M_c5nXvH75faY82g_yGd8I2_Z';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
