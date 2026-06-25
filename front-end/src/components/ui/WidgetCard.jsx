import React from 'react';

export function WidgetCard({ children, variant = 'white', className = '', style = {} }) {
  const isGradient = variant === 'gradient';
  
  return (
    <div
      className={`widget-card ${className}`}
      style={{
        background: isGradient 
          ? 'linear-gradient(135deg, #a855f7 0%, #60a5fa 100%)' // purple to cyan gradient matching the image
          : '#ffffff',
        borderRadius: '24px',
        padding: '24px',
        color: isGradient ? '#ffffff' : '#1e293b',
        boxShadow: isGradient 
          ? '0 10px 25px -5px rgba(168, 85, 247, 0.4)' 
          : '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {children}
    </div>
  );
}
