-- ==========================================
-- SCRIPT DE VALIDACIONES BACKEND (SUPABASE)
-- ==========================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase 
-- para añadir las restricciones de integridad y robustez.

-- 1. Evitar Doble Agendamiento
-- Añadimos una restricción única para que un mismo médico no pueda tener
-- dos citas en exactamente la misma fecha y hora.
ALTER TABLE consultas
ADD CONSTRAINT unique_medico_fecha_hora UNIQUE (medico_asignado, fecha, hora);

-- 2. Asegurar que campos vitales de paciente no sean nulos o vacíos
-- Esto previene que se inserte basura a la BD si alguien elude el frontend
ALTER TABLE pacientes
ADD CONSTRAINT check_paciente_rut_valido CHECK (char_length(rut) >= 8),
ADD CONSTRAINT check_paciente_nombre_valido CHECK (char_length(trim(nombre)) > 0);

-- 3. Asegurar que las consultas siempre tengan un motivo
ALTER TABLE consultas
ADD CONSTRAINT check_consulta_motivo_valido CHECK (char_length(trim(motivo)) > 0);

-- 4. Asegurar integridad en retiros
ALTER TABLE retiros
ADD CONSTRAINT check_retiros_rut_retira CHECK (char_length(trim(rut_retira)) > 0);
