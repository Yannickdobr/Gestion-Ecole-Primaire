"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ChartWidget } from '@/components/ui/ChartWidget';
import { MetricStat } from '@/components/ui/MetricStat';
import { TableWidget } from '@/components/ui/TableWidget';
import { getEleves, getEnseignants, getClasses } from '@/lib/api';
import { HelpCircle, Monitor, PieChart, Users, GraduationCap, AlertTriangle } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

export default function DirectorDashboard() {
  // t = dictionnaire de la langue courante (src/messages/{fr,en}.js)
  const { t } = useLanguage();

  // ─── Données réelles depuis l'API ───────────────────────────────────────
  const [kpis, setKpis] = useState({ totalEleves: 0, totalEnseignants: 0, totalClasses: 0 });
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        // Appels en parallèle ; chaque liste sert à calculer un compteur
        const [eleves, enseignants, classes] = await Promise.all([
          getEleves(),
          getEnseignants(),
          getClasses(),
        ]);
        if (!actif) return;
        setKpis({
          totalEleves: Array.isArray(eleves) ? eleves.length : 0,
          totalEnseignants: Array.isArray(enseignants) ? enseignants.length : 0,
          totalClasses: Array.isArray(classes) ? classes.length : 0,
        });
        // Pas d'endpoint global pour les rapports disciplinaires (uniquement par élève)
        setRapports([]);
      } catch (e) {
        if (actif) setError(e.message || "Erreur de chargement des données.");
      } finally {
        if (actif) setLoading(false);
      }
    })();
    return () => {
      actif = false;
    };
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <DashboardHeader />

      {/* Page Title & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
          {t?.nav_dashboard || 'Tableau de bord'}
        </h1>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', background: 'rgba(216,99,16,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)'
        }}>
          <HelpCircle size={14} />
        </div>
      </div>

      {/* Bandeau erreur / chargement */}
      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 24, borderRadius: 12,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#dc2626', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Top Section: Chart & Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Chart — pas encore de source de présence côté API */}
        <ChartWidget
          title={t?.chart_attendance_title || "Tendance de présence"}
          value={"—"}
          data={[]}
        />

        {/* Right: 2x2 Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          <MetricStat
            variant="gradient"
            value={loading ? "…" : kpis.totalEleves}
            label={t?.kpi_students || "Élèves inscrits"}
            icon={<GraduationCap size={20} />}
          />

          <MetricStat
            value={loading ? "…" : kpis.totalEnseignants}
            label={t?.kpi_teachers || "Enseignants actifs"}
            icon={<Users size={20} />}
          />

          <MetricStat
            value={loading ? "…" : kpis.totalClasses}
            label={t?.kpi_classes || "Classes ouvertes"}
            icon={<PieChart size={20} />}
          />

          <MetricStat
            value={"—"}
            label={t?.kpi_attendance || "Taux de présence"}
            icon={<Monitor size={20} />}
          />
        </div>
      </div>

      <TableWidget
        title={t?.discipline_title || "Rapports disciplinaires récents"}
        headers={['Élève', 'Classe', 'Libellé', 'Date', 'Points']}
        data={rapports}
        renderRow={(row) => (
          <>
            <td style={{ padding: '20px 32px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>
              {row.eleve}
            </td>
            <td style={{ padding: '20px 32px', fontSize: '14px', color: 'var(--muted)', borderBottom: '1px solid var(--surface-border)' }}>
              {row.classe}
            </td>
            <td style={{ padding: '20px 32px', borderBottom: '1px solid var(--surface-border)' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--muted)'
              }}>
                {row.libelle}
              </span>
            </td>
            <td style={{ padding: '20px 32px', fontSize: '14px', color: 'var(--muted)', borderBottom: '1px solid var(--surface-border)' }}>
              {row.event_date}
            </td>
            <td style={{ padding: '20px 32px', borderBottom: '1px solid var(--surface-border)' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                fontSize: '12px', fontWeight: 600
              }}>
                <AlertTriangle size={14} />
                {row.points}
              </span>
            </td>
          </>
        )}
      />
    </div>
  );
}
