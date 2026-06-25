import React from 'react';
import { WidgetCard } from './WidgetCard';

export function TableWidget({ title, headers, data, renderRow }) {
  return (
    <WidgetCard style={{ padding: '0px', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--surface-border)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>{title}</h3>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ 
                padding: '16px 32px', 
                fontSize: '14px', 
                fontWeight: 600, 
                color: 'var(--muted)',
                borderBottom: '1px solid var(--surface-border)'
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ transition: 'background 0.2s', cursor: 'pointer' }}>
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetCard>
  );
}
