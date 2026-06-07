export const formatRut = (value) => {
  if (!value) return '';
  // Eliminar caracteres que no sean números o la letra K
  let cleanValue = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanValue.length === 0) return '';
  
  if (cleanValue.length < 2) {
    return cleanValue;
  }
  
  // Separar cuerpo y dígito verificador
  let body = cleanValue.slice(0, -1);
  let dv = cleanValue.slice(-1);
  
  // Formatear cuerpo con puntos
  let formattedBody = '';
  for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
    formattedBody = body.charAt(i) + formattedBody;
    if (j % 3 === 0 && i !== 0) {
      formattedBody = '.' + formattedBody;
    }
  }
  
  return `${formattedBody}-${dv}`;
};

export const isValidRut = (rut) => {
  if (!rut) return false;
  let cleanValue = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanValue.length < 8) return false;
  
  let body = cleanValue.slice(0, -1);
  let dv = cleanValue.slice(-1);
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * multiplier;
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }
  
  let expectedDv = 11 - (sum % 11);
  let finalDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
  
  return dv === finalDv;
};

export const isValidEmail = (email) => {
  if (!email) return true; // Para campos opcionales
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
