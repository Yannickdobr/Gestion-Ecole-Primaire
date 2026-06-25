"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { WidgetCard } from './WidgetCard';

export function ChartWidget({ title, value, data }) {
  return (
    <WidgetCard style={{ padding: '32px', background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}>{title}</h2>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>{value}</div>
      </div>
      
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d86310" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#d86310" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'var(--muted)' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'var(--muted)' }} 
              tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid var(--surface-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            />
            <CartesianGrid vertical={false} stroke="var(--surface-border)" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="var(--orange)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVisits)" 
              activeDot={{ r: 8, fill: 'var(--text-dark)', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
