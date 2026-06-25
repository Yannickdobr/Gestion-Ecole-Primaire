import React from 'react';

export function Badge({ children, variant = 'primary', style = {} }) {
  const getColors = () => {
    switch (variant) {
      case 'danger': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' };
      case 'success': return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' };
      case 'warning': return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
      case 'info': return { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' };
      case 'primary': 
      default: return { bg: 'rgba(216,99,16,0.1)', color: 'var(--orange, #d86310)', border: 'rgba(216,99,16,0.3)' };
    }
  };

  const colors = getColors();

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '6px',
      fontSize: '11px', fontWeight: 600,
      background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`,
      ...style
    }}>
      {children}
    </span>
  );
}
