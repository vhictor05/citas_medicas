import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Pill, CalendarPlus, ClipboardList, Activity, AlertTriangle, Clock, CheckCircle2, Download } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { T } from '../../utils/theme';
import { generarPdfRetiroMedicamentos, generarPdfLicenciaMedica } from '../../utils/pdfGenerators';
import Btn from '../ui/Btn';
import StatPill from '../ui/StatPill';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

function FuncDashboard({ consultas, goTo, showToast, load, loadConsultas }) {
  // Ficha médica cacheada por consulta_id
  const [fichasMap, setFichasMap] = useState({});
  // Modal alerta de seguimiento
  const [modalSeguimiento, setModalSeguimiento] = useState({ open: false, consulta: null, ficha: null });
  // Modal para reasignar médico
  const [modalReasignar, setModalReasignar] = useState({ open: false, consultaId: null });
  const [nuevoMedico, setNuevoMedico] = useState('');

  // Cargar fichas médicas de las consultas en estado "Cerrada"
  useEffect(() => {
    const cerradas = consultas.filter(c => c.estado === 'Cerrada');
    if (!cerradas.length) return;

    const idsACargar = cerradas
      .map(c => c.id)
      .filter(id => !fichasMap[id]);

    if (!idsACargar.length) return;

    supabase
      .from('fichas_medicas')
      .select('*')
      .in('consulta_id', idsACargar)
      .then(({ data }) => {
        if (!data?.length) return;
        setFichasMap(prev => {
          const next = { ...prev };
          data.forEach(f => { next[f.consulta_id] = f; });
          return next;
        });
      });
  }, [consultas]);

  const marcarLlegada = (id) => load(async () => {
    const { error } = await supabase.from('consultas').update({ estado: 'En espera' }).eq('id', id);
    if (error) throw error;
    showToast('Paciente marcado como En espera');
    await loadConsultas();
  }, 'Actualizando...');

  const abrirModalReasignar = (id) => {
    setNuevoMedico('');
    setModalReasignar({ open: true, consultaId: id });
  };

  const confirmarReasignar = () => {
    const { consultaId } = modalReasignar;
    
    if (!nuevoMedico || nuevoMedico.trim() === '') {
      showToast('Debe ingresar un nombre de médico', 'warning');
      return;
    }
    
    setModalReasignar({ open: false, consultaId: null });
    
    load(async () => {
      const { error } = await supabase
        .from('consultas')
        .update({ medico_asignado: nuevoMedico.trim() })
        .eq('id', consultaId);
      
      if (error) {
        showToast('Error al reasignar: ' + error.message, 'error');
        throw error;
      }
      showToast('Médico reasignado correctamente', 'success');
      setNuevoMedico('');
      await loadConsultas();
    }, 'Reasignando...');
  };

  const cancelarReasignar = () => {
    setModalReasignar({ open: false, consultaId: null });
    setNuevoMedico('');
  };

  // Archivar: primero verifica seguimiento, luego archiva
  const solicitarArchivo = (consulta) => load(async () => {
    const ficha = fichasMap[consulta.id];

    // Si no tenemos la ficha cargada aún, intentar obtenerla
    let fichaFinal = ficha;
    if (!fichaFinal) {
      const { data } = await supabase
        .from('fichas_medicas')
        .select('*')
        .eq('consulta_id', consulta.id)
        .single();
      fichaFinal = data || null;
      if (fichaFinal) {
        setFichasMap(prev => ({ ...prev, [consulta.id]: fichaFinal }));
      }
    }

    // Regla de negocio: alertar si tiene seguimiento pendiente
    if (fichaFinal?.requiere_seguimiento && fichaFinal?.dias_seguimiento > 0) {
      setModalSeguimiento({ open: true, consulta, ficha: fichaFinal });
      return;
    }

    // Sin seguimiento → archivar directo
    await ejecutarArchivo(consulta.id);
  }, 'Verificando...');

  const ejecutarArchivo = async (consultaId) => {
    const { error } = await supabase.from('consultas').update({ estado: 'Completada' }).eq('id', consultaId);
    if (error) throw error;
    showToast('Consulta archivada y quitada de la bandeja', 'success');
    await loadConsultas();
  };

  const confirmarArchivoConSeguimiento = () => {
    const { consulta } = modalSeguimiento;
    setModalSeguimiento({ open: false, consulta: null, ficha: null });
    load(() => ejecutarArchivo(consulta.id), 'Archivando...');
  };

  const cancelarModal = () =>
    setModalSeguimiento({ open: false, consulta: null, ficha: null });

  // PDF Retiro de Medicamentos
  const handlePdfReceta = (consulta) => {
    const ficha = fichasMap[consulta.id];
    if (!ficha) { showToast('Cargando ficha médica, intente en un momento', 'warning'); return; }
    generarPdfRetiroMedicamentos(ficha, consulta.pacientes, consulta);
  };

  // PDF Licencia Médica
  const handlePdfLicencia = (consulta) => {
    const ficha = fichasMap[consulta.id];
    if (!ficha) { showToast('Cargando ficha médica, intente en un momento', 'warning'); return; }
    generarPdfLicenciaMedica(ficha, consulta.pacientes, consulta);
  };

  const stats = {
    total: consultas.length,
    urgencias: consultas.filter(c => c.urgencia).length,
    enAtencion: consultas.filter(c => c.estado === 'En atención').length,
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ animation: 'fadeUp 0.4s forwards' }}>

      {/* Banner de bienvenida Funcionario */}
      <div style={{ background: 'linear-gradient(120deg, rgba(29,78,216,0.18) 0%, rgba(37,99,235,0.08) 100%)', border: `1px solid rgba(59,130,246,0.2)`, borderLeft: `4px solid ${T.blue}`, borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(59,130,246,0.15)', border: `1px solid rgba(59,130,246,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.blue, flexShrink: 0 }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: T.blue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ventanilla de Recepción</p>
            <h1 style={{ margin: '0.1rem 0 0', color: T.textPrimary, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{saludo}, Funcionario</h1>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: '0.8rem' }}>{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Btn variant="secondary" onClick={() => load(loadConsultas, 'Actualizando...')}><RefreshCw size={14} /> Actualizar</Btn>
          <Btn variant="secondary" onClick={() => goTo('retiro')}><Pill size={14} /> Retiro Medicamentos</Btn>
          <Btn variant="primary" onClick={() => goTo('nueva-atencion')}><CalendarPlus size={14} /> Nueva Atención</Btn>
        </div>
      </div>

      {/* Stats dinámicos */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <StatPill icon={<ClipboardList size={16} />} label="Total" value={stats.total} color={T.blue} />
        <StatPill icon={<Activity size={16} />} label="En Atención" value={stats.enAtencion} color={stats.enAtencion > 0 ? T.amber : T.textMuted} />
        <StatPill icon={<AlertTriangle size={16} />} label="Urgencias" value={stats.urgencias} color={stats.urgencias > 0 ? T.red : T.textMuted} alert={stats.urgencias > 0} />
      </div>

      <Card>
        {consultas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: T.textMuted }}>
            <ClipboardList size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No hay consultas registradas hoy.</p>
          </div>
        ) : consultas.map((c, i) => {
          const ficha = fichasMap[c.id];
          const tieneReceta   = ficha?.emite_receta === true;
          const tieneLicencia = ficha?.emite_certificado === true;

          return (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', borderBottom: i < consultas.length - 1 ? `1px solid ${T.border}` : 'none', gap: '1rem', flexWrap: 'wrap', animation: 'slideIn 0.3s forwards', animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                <Avatar name={c.pacientes?.nombre || c.paciente_rut} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <Badge estado={c.estado} />
                    {c.urgencia && <Badge estado="Derivada a urgencia" />}
                  </div>
                  <p style={{ margin: 0, fontWeight: 700, color: T.textPrimary, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.pacientes?.nombre || c.paciente_rut}</p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: T.textSecondary, fontFamily: 'DM Mono, monospace' }}>
                    {c.paciente_rut} · {c.motivo}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem', flexShrink: 0 }}>
                <span style={{ color: T.textMuted, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'DM Mono, monospace' }}>
                  <Clock size={11} /> {c.hora || '--:--'} · {c.medico_asignado || 'Sin médico'}
                </span>

                {/* Acciones para estado Agendada */}
                {c.estado === 'Agendada' && (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <Btn size="sm" variant="secondary" onClick={() => abrirModalReasignar(c.id)}>Reasignar</Btn>
                    <Btn size="sm" variant="primary" onClick={() => marcarLlegada(c.id)}><CheckCircle2 size={12} /> Llegada</Btn>
                  </div>
                )}

                {/* Acciones para estado Cerrada */}
                {c.estado === 'Cerrada' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                    {/* Botones PDF (condicionales según ficha médica) */}
                    {(tieneReceta || tieneLicencia) && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {tieneReceta && (
                          <Btn size="sm" variant="secondary" onClick={() => handlePdfReceta(c)}
                            style={{ color: T.blue, borderColor: 'rgba(59,130,246,0.4)' }}>
                            <Download size={12} /> Descargar Receta
                          </Btn>
                        )}
                        {tieneLicencia && (
                          <Btn size="sm" variant="secondary" onClick={() => handlePdfLicencia(c)}
                            style={{ color: T.purple, borderColor: 'rgba(139,92,246,0.4)' }}>
                            <Download size={12} /> Descargar Licencia
                          </Btn>
                        )}
                      </div>
                    )}
                    {/* Botón Archivar */}
                    <Btn size="sm" variant="success" onClick={() => solicitarArchivo(c)}>
                      <CheckCircle2 size={12} /> Archivar / Listo
                    </Btn>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      {/* Modal: Advertencia de Seguimiento Pendiente */}
      <Modal
        isOpen={modalSeguimiento.open}
        title="Seguimiento Pendiente"
        onClose={cancelarModal}
        onConfirm={confirmarArchivoConSeguimiento}
        confirmText="Igualmente Archivar"
        cancelText="Cancelar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.875rem' }}>Regla de Negocio: Control Médico</span>
          </div>
          <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: 1.6 }}>
            El médico indicó que <strong style={{ color: '#f9fafb' }}>{modalSeguimiento.consulta?.pacientes?.nombre || modalSeguimiento.consulta?.paciente_rut}</strong> requiere un control de seguimiento en{' '}
            <strong style={{ color: '#fbbf24' }}>{modalSeguimiento.ficha?.dias_seguimiento} días</strong>.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
            ¿Está seguro de archivar esta consulta sin gestionar el control de seguimiento? Se recomienda agendar una nueva cita antes de archivar.
          </p>
        </div>
      </Modal>

      {/* Modal: Reasignar Médico */}
      <Modal
        isOpen={modalReasignar.open}
        title="Reasignar Médico"
        onClose={cancelarReasignar}
        onConfirm={confirmarReasignar}
        confirmText="Reasignar"
        cancelText="Cancelar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: T.textSecondary, fontSize: '0.875rem' }}>
            Ingrese el nombre del nuevo médico a asignar a esta consulta:
          </p>
          <input
            type="text"
            value={nuevoMedico}
            onChange={(e) => setNuevoMedico(e.target.value)}
            placeholder="Nombre del médico"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && confirmarReasignar()}
            style={{
              padding: '0.75rem 1rem',
              border: `1px solid ${T.border}`,
              borderRadius: '8px',
              background: '#ffffff',
              color: '#000000',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = T.blue;
              e.target.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.1)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = T.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default FuncDashboard;
