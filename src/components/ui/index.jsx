import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react';

export function Loader({ text = 'Procesando...' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ width: '44px', height: '44px', border: '4px solid #374151', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#f9fafb', fontWeight: 600 }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b' };
  const color = colors[toast.type] || '#10b981';
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, background: '#1f2937', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeIn 0.3s forwards', maxWidth: '380px' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      {toast.type === 'success' ? <CheckCircle2 size={20} color={color} /> : toast.type === 'warning' ? <AlertTriangle size={20} color={color} /> : <AlertCircle size={20} color={color} />}
      <span style={{ color: '#f9fafb', fontWeight: 500 }}>{toast.msg}</span>
    </div>
  );
}

export function BackBtn({ onClick, label = 'Volver' }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
      <ArrowLeft size={16} /> {label}
    </button>
  );
}

export function Breadcrumb({ steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={14} />}
          <span style={{ color: i === steps.length - 1 ? '#f9fafb' : '#60a5fa', fontWeight: i === steps.length - 1 ? 600 : 400, cursor: i < steps.length - 1 && s.onClick ? 'pointer' : 'default' }} onClick={s.onClick}>{s.label}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export function Badge({ estado }) {
  const map = {
    'Agendada':           { bg: 'rgba(59,130,246,0.2)', color: '#93c5fd' },
    'En espera':          { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8' },
    'En atención':        { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
    'Cerrada':            { bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
    'Cancelada':          { bg: 'rgba(239,68,68,0.2)', color: '#f87171' },
    'Derivada a urgencia':{ bg: '#ef4444', color: '#ffffff' },
  };
  const style = map[estado] || { bg: '#374151', color: '#9ca3af' };
  return (
    <span style={{ background: style.bg, color: style.color, padding: '0.15rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-block', letterSpacing: '0.02em' }}>{estado}</span>
  );
}

export function Card({ children, accent, style: extraStyle }) {
  return (
    <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', borderTop: accent ? `3px solid ${accent}` : undefined, ...extraStyle }}>
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input {...props} style={{ width: '100%', padding: '0.65rem 1rem', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', transition: 'border 0.2s', ...props.style }}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#374151'} />
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea {...props} style={{ width: '100%', padding: '0.65rem 1rem', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '90px', transition: 'border 0.2s', ...props.style }}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#374151'} />
  );
}

export function Btn({ children, variant = 'primary', onClick, disabled, style: extra, size = 'md' }) {
  const vars = {
    primary:   { bg: '#2563eb', color: '#fff', border: 'none', hover: '#1d4ed8' },
    success:   { bg: '#059669', color: '#fff', border: 'none', hover: '#047857' },
    danger:    { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', hover: 'rgba(239,68,68,0.3)' },
    'danger-solid': { bg: '#dc2626', color: '#fff', border: 'none', hover: '#b91c1c' },
    secondary: { bg: '#374151', color: '#d1d5db', border: '1px solid #4b5563', hover: '#4b5563' },
    warning:   { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)', hover: 'rgba(245,158,11,0.3)' },
  };
  const v = vars[variant] || vars.primary;
  const padding = size === 'sm' ? '0.35rem 0.75rem' : '0.65rem 1.25rem';
  const fontSize = size === 'sm' ? '0.78rem' : '0.875rem';
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding, fontSize, fontWeight: 600, borderRadius: '8px', border: v.border, background: hov ? v.hover : v.bg, color: v.color, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all 0.2s', fontFamily: 'inherit', ...extra }}>
      {children}
    </button>
  );
}

export function Avatar({ name, size = 48 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
      {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
  );
}

export function PatientCard({ pac }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#111827', borderRadius: '10px', border: '1px solid #374151', marginBottom: '1rem' }}>
      <Avatar name={pac.nombre} />
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: '#f9fafb' }}>{pac.nombre}</p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>RUT: {pac.rut} · Edad: {pac.edad ?? 'N/A'} años</p>
        {pac.patologias?.length > 0 && <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#f87171' }}>Patologías: {pac.patologias.join(', ')}</p>}
        {pac.alergias && <p style={{ margin: 0, fontSize: '0.78rem', color: '#fbbf24' }}>Alergias: {pac.alergias}</p>}
      </div>
    </div>
  );
}
