import React from 'react';

export function Section({ title, subtitle, children, icon, style = {} }) {
  return (
    <section style={{ marginBottom: '32px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        {icon && (
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--orange, #d86310), var(--brown-light, #ac3b02))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(216,99,16,0.3)'
          }}>
            {icon}
          </div>
        )}
        <div>
          <h2 style={{ 
            fontFamily: 'var(--font-display, "Playfair Display", serif)', 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--text-dark, #1a1208)', 
            margin: 0,
            lineHeight: 1.1
          }}>
            {title}
          </h2>
          {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-light, #8a7060)', margin: '2px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
