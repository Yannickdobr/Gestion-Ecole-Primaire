import React from 'react';

export function SegmentedFilter({ options, value, onChange, style = {} }) {
  return (
    <div style={{
      display: 'flex', background: 'var(--cream, #f0ebe4)', borderRadius: 12, padding: 3,
      gap: 2, border: '1px solid rgba(26,18,8,0.08)',
      ...style
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 9, border: 'none',
          background: value === opt.value
            ? 'linear-gradient(135deg, var(--orange, #d86310), var(--brown-light, #ac3b02))'
            : 'transparent',
          color: value === opt.value ? 'white' : 'var(--text-light, #8a7060)',
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
          boxShadow: value === opt.value ? '0 2px 8px rgba(216,99,16,0.3)' : 'none',
          whiteSpace: 'nowrap',
        }}>
          {opt.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
