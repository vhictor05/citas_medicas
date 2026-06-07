import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Pill, Search, CheckCircle2, AlertTriangle, AlertCircle, UserPlus } from 'lucide-react';
import { BackBtn, Breadcrumb, Card, Field, Input, Btn } from '../ui';
import { formatRut, isValidRut } from '../../utils/formatters';

export default function FuncRetiro({ goTo, showToast, load }) {
  const [rutPac, setRutPac] = useState('');
  const [rutRet, setRutRet] = useState('');
  const [resultado, setResultado] = useState(null);
  const [showRegRep, setShowRegRep] = useState(false);
  const [nuevoRep, setNuevoRep] = useState({ nombre: '', vinculo: '' });

  const verificar = () => load(async () => {
    if (!rutPac.trim() || !rutRet.trim()) { showToast('Ingrese ambos RUT', 'error'); return; }
    if (!isValidRut(rutPac)) { showToast('El RUT del paciente no es válido', 'error'); return; }
    if (!isValidRut(rutRet)) { showToast('El RUT de quien retira no es válido', 'error'); return; }

    setResultado(null); setShowRegRep(false);

    // 1. Verificar receta activa
    const { data: fichas, error: ef } = await supabase
      .from('fichas_medicas')
      .select('*')
      .eq('paciente_rut', rutPac.trim())
      .eq('emite_receta', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (ef) throw ef;
    if (!fichas || !fichas.length) { setResultado({ tipo: 'sin_receta' }); return; }

    const receta = fichas[0];
    let autorizado = false;
    let nombreRetira = 'Mismo Paciente';

    if (rutPac.trim() === rutRet.trim()) {
      autorizado = true;
    } else {
      const { data: rep, error: eRep } = await supabase.from('representantes')
        .select('*')
        .eq('paciente_rut', rutPac.trim())
        .eq('rut_representante', rutRet.trim())
        .maybeSingle();
      
      if (eRep) throw eRep;
      
      if (rep) { 
        autorizado = rep.autorizado; 
        nombreRetira = rep.nombre; 
      } else { 
        autorizado = false; 
        nombreRetira = 'No registrado'; 
      }
    }
    setResultado({ tipo: autorizado ? 'ok' : 'rechazado', receta, nombreRetira });
  }, 'Verificando...');

  const registrarRetiro = (esIncidente) => load(async () => {
    if (!resultado || !resultado.receta) {
      showToast('Error: No se encontró la receta.', 'error');
      return;
    }
    const { error } = await supabase.from('retiros').insert([{
      paciente_rut: rutPac.trim(), 
      consulta_id: resultado.receta.consulta_id,
      rut_retira: rutRet.trim(), 
      autorizado: !esIncidente,
      fecha: new Date().toISOString().split('T')[0],
      incidente: esIncidente, 
      motivo_rechazo: esIncidente ? 'Representante no autorizado' : null,
      retirado_por: resultado.nombreRetira
    }]);
    if (error) throw error;
    showToast(esIncidente ? 'Incidente registrado' : 'Entrega registrada correctamente ✓');
    goTo('dashboard');
  }, 'Registrando...');

  const registrarRepresentante = () => load(async () => {
    if (!nuevoRep.nombre.trim() || !nuevoRep.vinculo.trim()) { showToast('Complete los campos', 'error'); return; }
    const { error } = await supabase.from('representantes').insert([{
      paciente_rut: rutPac.trim(), rut_representante: rutRet.trim(),
      nombre: nuevoRep.nombre.trim(), vinculo: nuevoRep.vinculo.trim(), autorizado: true
    }]);
    if (error) throw error;
    showToast('Representante registrado y autorizado ✓');
    setResultado({ ...resultado, tipo: 'ok', nombreRetira: nuevoRep.nombre.trim() });
    setShowRegRep(false);
  }, 'Registrando representante...');

  return (
    <div style={{ animation: 'fadeIn 0.4s forwards', maxWidth: 900, margin: '0 auto' }}>
      <BackBtn onClick={() => goTo('dashboard')} />
      <Breadcrumb steps={[{ label: 'Dashboard', onClick: () => goTo('dashboard') }, { label: 'Retiro de Medicamentos' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: resultado ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <Card accent="#7c3aed">
          <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
            <Pill size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#a78bfa' }} />
            Verificar Autorización
          </h2>
          <Field label="RUT del Paciente (titular)">
            <Input placeholder="12.345.678-9" value={rutPac} onChange={e => setRutPac(formatRut(e.target.value))} />
          </Field>
          <Field label="RUT de quien retira">
            <Input placeholder="12.345.678-9" value={rutRet} onChange={e => setRutRet(formatRut(e.target.value))} />
          </Field>
          <Btn variant="primary" onClick={verificar} style={{ width: '100%', marginTop: '0.5rem' }}>
            <Search size={16} /> Verificar
          </Btn>
        </Card>

        {resultado && (
          <Card accent={resultado.tipo === 'ok' ? '#059669' : resultado.tipo === 'sin_receta' ? '#f59e0b' : '#ef4444'}>
            {resultado.tipo === 'sin_receta' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <AlertTriangle size={48} color="#fbbf24" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#fbbf24', margin: '0 0 0.5rem' }}>Sin Receta Activa</h3>
                <p style={{ color: '#6b7280' }}>El paciente no tiene recetas pendientes en el sistema.</p>
              </div>
            )}
            {resultado.tipo === 'ok' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={20} color="#34d399" />
                  <span style={{ color: '#34d399', fontWeight: 700 }}>AUTORIZADO</span>
                </div>
                <p style={{ color: '#d1d5db', marginBottom: '0.25rem' }}><strong>Retira:</strong> {resultado.nombreRetira}</p>
                <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}><strong>Receta:</strong> {resultado.receta.detalle_receta}</p>
                <Btn variant="success" onClick={() => registrarRetiro(false)} style={{ width: '100%' }}>
                  <CheckCircle2 size={16} /> Registrar Entrega
                </Btn>
              </div>
            )}
            {resultado.tipo === 'rechazado' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={20} color="#f87171" />
                  <span style={{ color: '#f87171', fontWeight: 700 }}>NO AUTORIZADO</span>
                </div>
                <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  "{resultado.nombreRetira}" no está autorizado para retirar esta receta.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Btn variant="danger-solid" onClick={() => registrarRetiro(true)} style={{ flex: 1 }}>
                    <AlertCircle size={15} /> Registrar Incidente
                  </Btn>
                  <Btn variant="secondary" onClick={() => setShowRegRep(!showRegRep)} style={{ flex: 1 }}>
                    <UserPlus size={15} /> Registrar Representante
                  </Btn>
                </div>
                {showRegRep && (
                  <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Field label="Nombre del Representante">
                      <Input placeholder="Nombre completo" value={nuevoRep.nombre} onChange={e => setNuevoRep({ ...nuevoRep, nombre: e.target.value })} />
                    </Field>
                    <Field label="Vínculo">
                      <Input placeholder="Ej: Hijo, Cónyuge, Tutor" value={nuevoRep.vinculo} onChange={e => setNuevoRep({ ...nuevoRep, vinculo: e.target.value })} />
                    </Field>
                    <Btn variant="success" onClick={registrarRepresentante}>
                      <CheckCircle2 size={15} /> Guardar y Autorizar
                    </Btn>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
