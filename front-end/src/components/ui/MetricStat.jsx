import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { WidgetCard } from './WidgetCard';

export function MetricStat({ value, label, trend, change, variant = 'white', icon }) {
  const isGradient = variant === 'gradient';
  
  return (
    <WidgetCard 
      variant={variant} 
      style={{ 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        border: isGradient ? 'none' : '1px solid var(--surface-border)',
        background: isGradient ? 'linear-gradient(135deg, var(--orange), var(--brown))' : 'var(--surface)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: '12px', 
          background: isGradient ? 'rgba(255,255,255,0.2)' : 'rgba(216,99,16,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isGradient ? 'white' : 'var(--orange)'
        }}>
          {icon || <HelpCircle size={20} />}
        </div>
        
        {change && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '16px',
            background: isGradient ? 'rgba(255,255,255,0.2)' : (trend === 'up' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)'),
            color: isGradient ? 'white' : (trend === 'up' ? '#16a34a' : '#ef4444'),
            fontSize: '12px', fontWeight: 600
          }}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </div>
        )}
      </div>

      <div>
        <div style={{ 
          fontSize: '28px', fontWeight: 800, 
          color: isGradient ? 'white' : 'var(--text-dark)', 
          fontFamily: 'var(--font-display)',
          lineHeight: 1.2 
        }}>
          {value}
        </div>
        <div style={{ 
          fontSize: '14px', fontWeight: 500, 
          color: isGradient ? 'rgba(255,255,255,0.8)' : 'var(--muted)',
          marginTop: '4px'
        }}>
          {label}
          <span style={{
          padding: '4px 12px', borderRadius: '12px', 
          background: isGradient ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
          color: isGradient ? 'white' : '#94a3b8',
          cursor: 'pointer',
          transition: 'background 0.2s'
      }}>See more</span>
        </div>
      </div>
    </WidgetCard>
  );
}
