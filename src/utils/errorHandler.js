export const handleSupabaseError = (error) => {
  if (!error) return 'Error desconocido.';
  
  console.error("Supabase Error:", error);

  // Mapeo de códigos de error de Postgres / Supabase a mensajes amigables
  switch (error.code) {
    case '23505':
      return 'Ya existe un registro con estos datos únicos (ej. RUT duplicado).';
    case 'PGRST116':
      return 'No se encontró el registro solicitado.';
    case '23503':
      return 'Error de relación. Es probable que el paciente no exista.';
    case '23514':
      return 'Los datos ingresados no cumplen con las reglas del sistema.';
    default:
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        return 'Error de conexión. Revisa tu acceso a internet e intenta nuevamente.';
      }
      return error.message || 'Ha ocurrido un error inesperado en la base de datos.';
  }
};
