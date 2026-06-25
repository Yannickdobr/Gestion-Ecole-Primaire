import React from 'react';

export function Card({ children, className = '', padding = '20px', style = {} }) {
  return (
    <div
      className={`card-component ${className}`}
      style={{
        background: 'var(--surface, #ffffff)',
        borderRadius: '20px',
        padding,
        border: '1px solid var(--silver, rgba(26,18,8,0.07))',
        boxShadow: '0 4px 20px rgba(26,18,8,0.06)',
        ...style
      }}
    >
      {children}
    </div>
  );
}
