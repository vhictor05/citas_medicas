import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FileText, CheckCircle2 } from 'lucide-react';
import { BackBtn, Breadcrumb, Card, Field, Input, Textarea, PatientCard, Btn, Modal } from '../ui';

export default function MedicoAtencion({ consulta, paciente, goTo, showToast, load }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    signos: '', sintomas: '', examen: '', diag1: '', diag2: '', obs: '', instrucciones: '',
    emiteReceta: false, receta: '', emiteCert: false, reposo: '',
    reqSegui: false, diasSegui: ''
  });
  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const confirmarCierre = () => {
    if (!form.diag1.trim()) {
      showToast('Debe ingresar al menos un Diagnóstico Principal', 'error');
      return;
    }

    if (form.emiteCert && (!form.reposo || parseInt(form.reposo) <= 0)) {
      showToast('Ingrese un número de días de reposo válido', 'error');
      return;
    }

    if (form.reqSegui && (!form.diasSegui || parseInt(form.diasSegui) <= 0)) {
      showToast('Ingrese un número de días de seguimiento válido', 'error');
      return;
    }

    setShowConfirm(true);
  };
    
  const ejecutarCierre = () => {
    setShowConfirm(false);
    load(async () => {
      const ficha = {
        consulta_id: consulta.id, 
        paciente_rut: paciente.rut,
        fecha: new Date().toISOString().split('T')[0], 
        medico: consulta.medico_asignado || 'Médico Titular',
        signos_vitales: form.signos, 
        sintomas_detectados: form.sintomas, 
        examen_fisico: form.examen,
        diagnostico: form.diag1, 
        diagnostico_secundario: form.diag2, 
        observaciones: form.obs,
        instrucciones_paciente: form.instrucciones,
        emite_receta: form.emiteReceta, 
        detalle_receta: form.emiteReceta ? form.receta : null,
        emite_certificado: form.emiteCert, 
        dias_reposo: form.emiteCert ? parseInt(form.reposo) || null : null,
        requiere_seguimiento: form.reqSegui, 
        dias_seguimiento: form.reqSegui ? parseInt(form.diasSegui) || null : null,
        estado_cierre: 'Cerrada Administrativamente'
      };
      
      const { error: e1 } = await supabase.from('fichas_medicas').insert([ficha]);
      if (e1) throw e1;
      
      const nuevoEstado = (form.emiteReceta || form.reqSegui) ? 'Cerrada' : 'Completada';
      const { error: e2 } = await supabase.from('consultas').update({ estado: nuevoEstado }).eq('id', consulta.id);
      if (e2) throw e2;
      
      showToast('Atención finalizada y guardada ✓');
      goTo('dashboard');
    }, 'Guardando ficha médica...');
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <BackBtn onClick={() => goTo('dashboard')} label="Volver a Agenda" />
      </div>
      <Breadcrumb steps={[{ label: 'Agenda', onClick: () => goTo('dashboard') }, { label: 'Atención Clínica' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div>
          <Card style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Paciente</h3>
            <PatientCard pac={paciente || {}} />
            <div style={{ background: '#111827', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Motivo de Consulta</p>
              <p style={{ color: '#d1d5db', fontStyle: 'italic', margin: 0, fontSize: '0.875rem' }}>"{consulta?.motivo}"</p>
            </div>
          </Card>
          <Card>
            <h3 style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Antecedentes</h3>
            <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>
              <strong>Patologías:</strong> {paciente?.patologias?.join(', ') || 'Ninguna registrada'}
            </p>
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', margin: 0 }}>
              <strong>Alergias:</strong> {paciente?.alergias || 'Ninguna'}
            </p>
          </Card>
        </div>

        <Card accent="#2563eb">
          <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
            <FileText size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#60a5fa' }} />
            Registro Clínico
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Signos Vitales">
                <Input placeholder="PA 120/80 · FC 75 · T 36.8 · SO2 98%" value={form.signos} onChange={e => f('signos', e.target.value)} />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Síntomas Principales Detectados">
                <Textarea placeholder="Describa los síntomas observados..." value={form.sintomas} onChange={e => f('sintomas', e.target.value)} />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Examen Físico">
                <Textarea placeholder="Hallazgos del examen físico..." value={form.examen} onChange={e => f('examen', e.target.value)} />
              </Field>
            </div>
            <Field label="Diagnóstico Principal *">
              <Input placeholder="CIE-10 o descripción" value={form.diag1} onChange={e => f('diag1', e.target.value)} />
            </Field>
            <Field label="Diagnóstico Secundario">
              <Input placeholder="Opcional" value={form.diag2} onChange={e => f('diag2', e.target.value)} />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Observaciones Clínicas">
                <Textarea placeholder="Notas adicionales para el expediente..." value={form.obs} onChange={e => f('obs', e.target.value)} style={{ minHeight: '70px' }} />
              </Field>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #374151', margin: '1.25rem 0' }} />

          {[
            { key: 'emiteReceta', label: '📋 Emitir Receta Médica', subKey: 'receta', subLabel: 'Detalle de medicamentos y dosis', isText: true },
            { key: 'emiteCert', label: '📄 Emitir Certificado / Licencia', subKey: 'reposo', subLabel: 'Días de reposo', isText: false },
            { key: 'reqSegui', label: '🔁 Requiere Seguimiento', subKey: 'diasSegui', subLabel: 'Control en (días)', isText: false },
          ].map(t => (
            <div key={t.key} style={{ marginBottom: '1rem' }}>
              <div onClick={() => f(t.key, !form[t.key])} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', background: form[t.key] ? 'rgba(59,130,246,0.1)' : '#111827', border: `1px solid ${form[t.key] ? 'rgba(59,130,246,0.4)' : '#374151'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: form[t.key] ? '#2563eb' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {form[t.key] && <CheckCircle2 size={14} color="white" />}
                </div>
                <span style={{ fontWeight: 600, color: form[t.key] ? '#93c5fd' : '#d1d5db' }}>{t.label}</span>
              </div>
              {form[t.key] && (
                <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.2s forwards' }}>
                  {t.isText
                    ? <Textarea placeholder={t.subLabel} value={form[t.subKey]} onChange={e => f(t.subKey, e.target.value)} style={{ minHeight: '80px' }} />
                    : <Input type="number" min="1" placeholder={t.subLabel} value={form[t.subKey]} onChange={e => f(t.subKey, e.target.value)} />
                  }
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '0.5rem' }}>
            <Field label="Instrucciones para el Paciente">
              <Textarea placeholder="Indicaciones, cuidados en casa, medicación..." value={form.instrucciones} onChange={e => f('instrucciones', e.target.value)} style={{ minHeight: '70px' }} />
            </Field>
          </div>

          <Btn variant="success" onClick={confirmarCierre} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
            <CheckCircle2 size={18} /> Cerrar Consulta y Guardar Ficha Médica
          </Btn>
        </Card>
      </div>

      <Modal 
        isOpen={showConfirm} 
        title="Finalizar Atención" 
        onClose={() => setShowConfirm(false)} 
        onConfirm={ejecutarCierre}
        confirmText="Sí, Cerrar Consulta"
      >
        <p>¿Está seguro de finalizar esta atención?</p>
        <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>Una vez cerrada, no podrá ser modificada ni se podrán emitir más documentos para esta consulta.</p>
      </Modal>
    </div>
  );
}
