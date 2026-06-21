import React from 'react';
import { Users, RefreshCw, Pill, CalendarPlus, ClipboardList, Activity, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { T } from '../../utils/theme';
import Btn from '../ui/Btn';
import StatPill from '../ui/StatPill';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

function FuncDashboard({ consultas, goTo, showToast, load, loadConsultas }) {
  const marcarLlegada = (id) => load(async()=>{
    const { error } = await supabase.from('consultas').update({estado:'En espera'}).eq('id',id);
    if (error) throw error;
    showToast('Paciente marcado como En espera');
    await loadConsultas();
  },'Actualizando...');

  const reasignarMedico = (id) => {
    const nuevo = window.prompt('Ingrese el nombre del nuevo médico:');
    if (!nuevo) return;
    load(async()=>{
      const { error } = await supabase.from('consultas').update({medico_asignado:nuevo}).eq('id',id);
      if (error) throw error;
      showToast('Médico reasignado');
      await loadConsultas();
    },'Reasignando...');
  };

  const stats = {
    total: consultas.length,
    urgencias: consultas.filter(c=>c.urgencia).length,
    enAtencion: consultas.filter(c=>c.estado==='En atención').length,
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ animation:'fadeUp 0.4s forwards' }}>

      {/* Banner de bienvenida Funcionario */}
      <div style={{ background:'linear-gradient(120deg, rgba(29,78,216,0.18) 0%, rgba(37,99,235,0.08) 100%)', border:`1px solid rgba(59,130,246,0.2)`, borderLeft:`4px solid ${T.blue}`, borderRadius:'14px', padding:'1.25rem 1.5rem', marginBottom:'1.75rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:48, height:48, borderRadius:'12px', background:'rgba(59,130,246,0.15)', border:`1px solid rgba(59,130,246,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', color:T.blue, flexShrink:0 }}>
            <Users size={24}/>
          </div>
          <div>
            <p style={{ margin:0, fontSize:'0.75rem', color:T.blue, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Ventanilla de Recepción</p>
            <h1 style={{ margin:'0.1rem 0 0', color:T.textPrimary, fontSize:'1.3rem', fontWeight:800, letterSpacing:'-0.02em' }}>{saludo}, Funcionario</h1>
            <p style={{ margin:0, color:T.textSecondary, fontSize:'0.8rem' }}>{new Date().toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
          <Btn variant="secondary" onClick={()=>load(loadConsultas,'Actualizando...')}><RefreshCw size={14}/> Actualizar</Btn>
          <Btn variant="secondary" onClick={()=>goTo('retiro')}><Pill size={14}/> Retiro Medicamentos</Btn>
          <Btn variant="primary" onClick={()=>goTo('nueva-atencion')}><CalendarPlus size={14}/> Nueva Atención</Btn>
        </div>
      </div>

      {/* Stats dinámicos */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <StatPill icon={<ClipboardList size={16}/>} label="Total" value={stats.total} color={T.blue}/>
        <StatPill icon={<Activity size={16}/>} label="En Atención" value={stats.enAtencion} color={stats.enAtencion>0?T.amber:T.textMuted}/>
        <StatPill icon={<AlertTriangle size={16}/>} label="Urgencias" value={stats.urgencias} color={stats.urgencias>0?T.red:T.textMuted} alert={stats.urgencias>0}/>
      </div>

      <Card>
        {consultas.length===0 ? (
          <div style={{ textAlign:'center', padding:'3.5rem 0', color:T.textMuted }}>
            <ClipboardList size={40} style={{ margin:'0 auto 1rem', display:'block', opacity:0.4 }}/>
            <p style={{ margin:0, fontSize:'0.9rem' }}>No hay consultas registradas hoy.</p>
          </div>
        ) : consultas.map((c,i)=>(
          <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.1rem 0', borderBottom: i<consultas.length-1 ? `1px solid ${T.border}` : 'none', gap:'1rem', flexWrap:'wrap', animation:'slideIn 0.3s forwards', animationDelay:`${i*0.04}s`, opacity:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', flex:1, minWidth:0 }}>
              <Avatar name={c.pacientes?.nombre||c.paciente_rut} size={38}/>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                  <Badge estado={c.estado}/>
                  {c.urgencia && <Badge estado="Derivada a urgencia"/>}
                </div>
                <p style={{ margin:0, fontWeight:700, color:T.textPrimary, fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.pacientes?.nombre||c.paciente_rut}</p>
                <p style={{ margin:'0.15rem 0 0', fontSize:'0.75rem', color:T.textSecondary, fontFamily:'DM Mono, monospace' }}>
                  {c.paciente_rut} · {c.motivo}
                </p>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.45rem', flexShrink:0 }}>
              <span style={{ color:T.textMuted, fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.3rem', fontFamily:'DM Mono, monospace' }}>
                <Clock size={11}/> {c.hora||'--:--'} · {c.medico_asignado||'Sin médico'}
              </span>
              {c.estado==='Agendada' && (
                <div style={{ display:'flex', gap:'0.4rem' }}>
                  <Btn size="sm" variant="secondary" onClick={()=>reasignarMedico(c.id)}>Reasignar</Btn>
                  <Btn size="sm" variant="primary" onClick={()=>marcarLlegada(c.id)}><CheckCircle2 size={12}/> Llegada</Btn>
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default FuncDashboard;
