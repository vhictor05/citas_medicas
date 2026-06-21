import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Btn from './Btn';

export default function Modal({ isOpen, title, onClose, onConfirm, confirmText = 'Aceptar', cancelText = 'Cancelar', children }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#f59e0b' }}>
          <AlertTriangle size={24} />
          <h2 style={{ margin: 0, color: '#f9fafb', fontSize: '1.25rem' }}>{title}</h2>
        </div>
        <div style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          {children}
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>{cancelText}</Btn>
          <Btn variant="danger-solid" onClick={onConfirm}>{confirmText}</Btn>
        </div>
      </div>
    </div>
  );
}
