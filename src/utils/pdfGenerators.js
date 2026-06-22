/**
 * pdfGenerators.js
 * Genera y descarga documentos PDF directamente usando jsPDF.
 * No abre ningún diálogo de impresión; el archivo se descarga
 * de forma inmediata al sistema local del usuario.
 */

import { jsPDF } from 'jspdf';

// ── Paleta de colores (RGB) ────────────────────────────────────────────────────
const C = {
  blue:        [37,  99, 235],
  blueLight:   [239, 246, 255],
  blueBorder:  [191, 219, 254],
  blueDark:    [30,  64, 175],
  green:       [5,   150, 105],
  greenLight:  [240, 253, 244],
  amber:       [217, 119, 6],
  amberLight:  [255, 251, 235],
  gray50:      [248, 250, 252],
  gray100:     [243, 244, 246],
  gray200:     [229, 231, 235],
  gray400:     [156, 163, 175],
  gray500:     [107, 114, 128],
  gray700:     [55,  65,  81],
  gray900:     [17,  24,  39],
  white:       [255, 255, 255],
  red:         [239, 68,  68],
  redLight:    [254, 226, 226],
};

// ── Helpers de dibujo ──────────────────────────────────────────────────────────

function setFill(doc, rgb)   { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setStroke(doc, rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
function setColor(doc, rgb)  { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }

/** Dibuja un rectángulo redondeado relleno con borde opcional */
function roundedRect(doc, x, y, w, h, r, fillRgb, strokeRgb = null) {
  setFill(doc, fillRgb);
  if (strokeRgb) { setStroke(doc, strokeRgb); doc.roundedRect(x, y, w, h, r, r, 'FD'); }
  else            { doc.roundedRect(x, y, w, h, r, r, 'F'); }
}

/** Etiqueta gris pequeña + valor debajo */
function fieldBlock(doc, x, y, label, value, mono = false) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.gray400);
  doc.text(label.toUpperCase(), x, y);

  doc.setFontSize(9.5);
  doc.setFont(mono ? 'courier' : 'helvetica', 'bold');
  setColor(doc, C.gray900);
  doc.text(value || '—', x, y + 5);
}

/** Caja con acento de color lateral (highlight box) */
function highlightBox(doc, x, y, w, text, title, accentRgb, bgRgb, curY) {
  const padding   = 4;
  const lineH     = 5;
  const titleH    = 6;
  const maxW      = w - padding * 2 - 3; // descontando acento (3mm)

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, maxW);
  const boxH  = titleH + lines.length * lineH + padding * 2;

  // Fondo
  roundedRect(doc, x, curY, w, boxH, 2, bgRgb);
  // Acento lateral
  setFill(doc, accentRgb);
  doc.rect(x, curY, 3, boxH, 'F');

  // Título
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.gray500);
  doc.text(title.toUpperCase(), x + 5, curY + padding + 3);

  // Texto
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.gray700);
  doc.text(lines, x + 5, curY + padding + titleH + 2);

  return curY + boxH + 5; // siguiente Y
}

/** Encabezado del documento */
function drawHeader(doc, tipoDoc, subtipo) {
  const W = 210; // A4 width mm

  // Banda superior azul
  setFill(doc, C.blue);
  doc.rect(0, 0, W, 22, 'F');

  // Logo "⚕ SaludNet"
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.white);
  doc.text('SaludNet', 14, 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [191, 219, 254]); // azul claro
  doc.text('Sistema de Gestión de Atención Médica', 14, 19);

  // Tipo de documento (derecha)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.white);
  doc.text(tipoDoc, W - 14, 13, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [191, 219, 254]);
  doc.text(subtipo, W - 14, 18.5, { align: 'right' });

  // Línea separadora azul oscuro debajo del banner
  setFill(doc, C.blueDark);
  doc.rect(0, 22, W, 1.5, 'F');

  return 32; // Y inicial del contenido
}

/** Línea divisoria de sección */
function sectionTitle(doc, x, y, w, label) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.gray500);
  doc.text(label.toUpperCase(), x, y);

  setStroke(doc, C.gray200);
  doc.setLineWidth(0.3);
  doc.line(x, y + 1.5, x + w, y + 1.5);

  return y + 7;
}

/** Pie de página con firma y número de doc */
function drawFooter(doc, medico, docNum) {
  const W   = 210;
  const yF  = 270;

  setStroke(doc, C.gray200);
  doc.setLineWidth(0.3);
  doc.line(14, yF, W - 14, yF);

  // Firma
  setStroke(doc, C.gray400);
  doc.setLineWidth(0.4);
  doc.line(14, yF + 12, 95, yF + 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.gray900);
  doc.text(medico, 14, yF + 17);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.gray400);
  doc.text('FIRMA Y TIMBRE DEL MÉDICO', 14, yF + 21);

  // Fecha + N° doc (derecha)
  const hoy = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(8);
  setColor(doc, C.gray500);
  doc.text(`Fecha de emisión: ${hoy}`, W - 14, yF + 15, { align: 'right' });

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  setColor(doc, C.gray400);
  doc.text(`# ${docNum}`, W - 14, yF + 20, { align: 'right' });
}

function genDocNum() {
  return 'DOC-' + Date.now().toString(36).toUpperCase();
}

function formatFecha(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr + 'T12:00:00');
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── PDF 1: Retiro de Medicamentos ──────────────────────────────────────────────

export function generarPdfRetiroMedicamentos(ficha, paciente, consulta) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const docNum = genDocNum();
  const W      = 196; // margen izq 14, der 14 → ancho útil
  const X      = 14;
  const medico = ficha?.medico || consulta?.medico_asignado || 'Médico Titular';
  const nombre = paciente?.nombre || ficha?.paciente_rut || '—';

  let y = drawHeader(doc, 'Receta Médica', 'Documento para Retiro de Medicamentos');

  // Aviso
  roundedRect(doc, X, y, W, 11, 2, C.amberLight, C.amber);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.amber);
  doc.text('AVISO:', X + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.gray700);
  doc.text('Valido solo para retiro de medicamentos. Presente cedula de identidad en la farmacia.', X + 20, y + 5);
  y += 17;

  // Datos del Paciente
  y = sectionTitle(doc, X, y, W, 'Datos del Paciente');

  fieldBlock(doc, X,      y, 'Nombre Completo', nombre);
  fieldBlock(doc, X + 70, y, 'RUT', ficha?.paciente_rut || '—', true);
  fieldBlock(doc, X + 140, y, 'Edad', paciente?.edad ? `${paciente.edad} años` : '—');
  y += 18;

  // Datos Clínicos
  y = sectionTitle(doc, X, y, W, 'Antecedentes Clínicos');

  fieldBlock(doc, X,      y, 'Médico Prescriptor', medico);
  fieldBlock(doc, X + 100, y, 'Fecha de Consulta', formatFecha(ficha?.fecha));
  y += 14;

  const diagText = (ficha?.diagnostico || '—') + (ficha?.diagnostico_secundario ? ' · ' + ficha.diagnostico_secundario : '');
  fieldBlock(doc, X, y, 'Diagnóstico', diagText);
  y += 14;

  // Medicamentos (caja azul)
  y = highlightBox(doc, X, y, W,
    ficha?.detalle_receta || 'Sin detalle registrado.',
    'Medicamentos Prescritos',
    C.blue, C.blueLight, y
  );

  // Instrucciones (caja verde, si hay)
  if (ficha?.instrucciones_paciente) {
    y = highlightBox(doc, X, y, W,
      ficha.instrucciones_paciente,
      'Instrucciones de Uso',
      C.green, C.greenLight, y
    );
  }

  // Alergias (caja roja, si hay)
  if (paciente?.alergias) {
    y = highlightBox(doc, X, y, W,
      'Alergias registradas: ' + (paciente.alergias || ''),
      'Precaucion - Alergias',
      C.red, C.redLight, y
    );
  }

  drawFooter(doc, medico, docNum);

  // Nombre del archivo seguro
  const safeNombre = nombre.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, '').trim().replace(/\s+/g, '_');
  doc.save(`Receta_Medica_${safeNombre}.pdf`);
}

// ── PDF 2: Licencia Médica ──────────────────────────────────────────────────────

export function generarPdfLicenciaMedica(ficha, paciente, consulta) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const docNum = genDocNum();
  const W      = 196;
  const X      = 14;
  const medico = ficha?.medico || consulta?.medico_asignado || 'Médico Titular';
  const nombre = paciente?.nombre || ficha?.paciente_rut || '—';

  // Calcular fecha de término
  let fechaTermino = '—';
  if (ficha?.fecha && ficha?.dias_reposo) {
    const inicio = new Date(ficha.fecha + 'T12:00:00');
    inicio.setDate(inicio.getDate() + parseInt(ficha.dias_reposo));
    fechaTermino = inicio.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  let y = drawHeader(doc, 'Licencia Médica', 'Certificado de Reposo Laboral');

  // Datos del Paciente
  y = sectionTitle(doc, X, y, W, 'Datos del Trabajador / Paciente');

  fieldBlock(doc, X,       y, 'Nombre Completo', nombre);
  fieldBlock(doc, X + 70,  y, 'RUT', ficha?.paciente_rut || '—', true);
  fieldBlock(doc, X + 140, y, 'Edad', paciente?.edad ? `${paciente.edad} años` : '—');
  y += 14;

  if (paciente?.direccion) {
    fieldBlock(doc, X, y, 'Domicilio', paciente.direccion);
    y += 14;
  }

  // Período de Licencia (caja azul destacada)
  const diasLabel = `${ficha?.dias_reposo || '—'} días de reposo`;
  const periodoTexto = `Inicio: ${formatFecha(ficha?.fecha)}     Término estimado: ${fechaTermino}`;

  // Caja período
  roundedRect(doc, X, y, W, 28, 3, C.blueLight, C.blueBorder);
  setFill(doc, C.blue);
  doc.rect(X, y, 3, 28, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.gray500);
  doc.text('PERIODO DE REPOSO AUTORIZADO', X + 6, y + 6);

  // Número grande de días
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.blue);
  doc.text(String(ficha?.dias_reposo || '—'), X + 6, y + 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.gray700);
  doc.text('días', X + 6 + (String(ficha?.dias_reposo || '—').length * 6.5) + 1, y + 20);

  // Fechas al lado
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.gray900);
  doc.text('Desde:', X + 55, y + 14);
  doc.text('Hasta:', X + 55, y + 21);

  doc.setFont('helvetica', 'normal');
  setColor(doc, C.gray700);
  doc.text(formatFecha(ficha?.fecha), X + 75, y + 14);
  doc.text(fechaTermino, X + 55 + 43, y + 21);

  y += 35;

  // Datos Médicos
  y = sectionTitle(doc, X, y, W, 'Antecedentes Médicos');

  fieldBlock(doc, X,       y, 'Médico Tratante', medico);
  fieldBlock(doc, X + 100, y, 'Fecha de Atención', formatFecha(ficha?.fecha));
  y += 14;

  const diagText = (ficha?.diagnostico || '—') + (ficha?.diagnostico_secundario ? ' · ' + ficha.diagnostico_secundario : '');
  fieldBlock(doc, X, y, 'Diagnóstico', diagText);
  y += 14;

  // Observaciones (caja ambar, si hay)
  if (ficha?.observaciones) {
    y = highlightBox(doc, X, y, W,
      ficha.observaciones,
      'Observaciones del Medico',
      C.amber, C.amberLight, y
    );
  }

  // Instrucciones (caja verde, si hay)
  if (ficha?.instrucciones_paciente) {
    y = highlightBox(doc, X, y, W,
      ficha.instrucciones_paciente,
      'Indicaciones durante el Reposo',
      C.green, C.greenLight, y
    );
  }

  drawFooter(doc, medico, docNum);

  const safeNombre = nombre.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, '').trim().replace(/\s+/g, '_');
  doc.save(`Licencia_Medica_${safeNombre}.pdf`);
}
