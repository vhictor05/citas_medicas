export const handleSupabaseError = (error, action) => {
  if (!error) return { message: 'Error desconocido.', originalError: error };
  
  console.error(`Error in ${action || 'Supabase'}:`, error);

  let message = 'Error inesperado de conexión.';

  if (error.code) {
    switch (error.code) {
      case '23505':
        message = 'Ya existe un registro con estos datos únicos (ej. RUT duplicado).';
        break;
      case 'PGRST116':
        message = 'No se encontró el registro solicitado.';
        break;
      case '23503':
        message = 'Error de relación. Es probable que el paciente no exista.';
        break;
      case '23514':
        message = 'Los datos ingresados no cumplen con las reglas del sistema.';
        break;
      default:
        message = error.message || 'Ha ocurrido un error inesperado en la base de datos.';
    }
  } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
    message = 'Error de conexión. Revisa tu acceso a internet e intenta nuevamente.';
  } else {
    message = error.message || 'Ha ocurrido un error inesperado.';
  }

  return { message, originalError: error };
};
