import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjxgmzdfwmvqyqxlcoil.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_viRV51M_c5nXvH75faY82g_yGd8I2_Z';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { error } = await supabase.from('retiros').insert([{
      paciente_rut: "26.684.039-4", 
      consulta_id: "a279fc54-b2a1-4795-914e-a42074347f43",
      rut_retira: "26.684.039-4", 
      autorizado: true,
      fecha: new Date().toISOString().split('T')[0],
      incidente: false, 
      motivo_rechazo: null,
      retirado_por: 'Mismo Paciente'
    }]);
  
  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert success!");
  }
}

run();
