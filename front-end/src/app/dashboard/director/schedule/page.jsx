'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  FiAlertTriangle, FiUserPlus, FiEdit2, FiPrinter,
  FiDownload, FiChevronLeft, FiChevronRight, FiClock,
  FiBookOpen, FiUser, FiMapPin, FiCalendar, FiGrid,
  FiPlus, FiTrash2, FiX,
} from 'react-icons/fi';
import {
  MdOutlineClass, MdOutlineMeetingRoom,
} from 'react-icons/md';
import { BsPersonFill, BsCalendar3 } from 'react-icons/bs';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useActiveYear } from '@/context/ActiveYearContext';
import {
  getClasses, getEnseignants, getSalles, getCours, getEmploi,
  createEmploi, deleteEmploi, verifierConflitsEmploi,
} from '@/lib/api';
import { imprimerEmploi } from '@/lib/print';
import { exporterCSV } from '@/lib/export';

// Créneaux horaires sélectionnables (hors pauses)
const HEURES_CRENEAUX = ['08:00', '09:30', '11:15', '14:00', '15:30'];

// Style des <select> du formulaire d'ajout
const selectStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid rgba(26,18,8,0.12)', fontSize: 14,
  fontFamily: 'inherit', background: '#faf9f7', outline: 'none', boxSizing: 'border-box',
};

// Jours d'école (constante d'affichage, pas une donnée métier)
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Palette pour colorer cours/enseignants (la BD ne stocke pas de couleur)
const PALETTE = ['#d86310', '#7a3b1e', '#ac3b02', '#4a3728', '#8a7060', '#d97706', '#16a34a', '#2563eb'];

const initialesDe = (prenom = '', nom = '') =>
  `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase() || '??';

// Normalise l'heure stockée ("08h00", "8:0"...) en "HH:MM"
const normaliserHeure = (h = '') => {
  const [hh = '0', mm = '0'] = String(h).replace('h', ':').split(':');
  return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
};

// ─── Adaptateurs API -> formes attendues par l'UI ────────────────────────
const adaptClasses = (rows = []) =>
  rows.map((c) => ({ idClasse: c.idClasse, libelle: c.libelle, idCycle: c.cycle?.idCycle }));

const adaptEnseignants = (rows = []) =>
  rows.map((e, i) => ({
    idPers: e.personne?.idPers,
    idClasse: e.classe?.idClasse, // pour filtrer l'EDT (un créneau ne stocke pas l'enseignant)
    nom: e.personne?.nom || '',
    prenom: e.personne?.prenom || '',
    initiales: initialesDe(e.personne?.prenom, e.personne?.nom),
    couleur: PALETTE[i % PALETTE.length],
  }));

const adaptSalles = (rows = []) =>
  rows.map((s) => ({
    idSalle: s.idSalle, libelle: s.libelle, position: s.position,
    surface: s.surface, idClasse: s.classe?.idClasse,
  }));

const adaptCours = (rows = []) =>
  rows.map((c, i) => ({
    idCours: c.idCours, libelle: c.libelle,
    coefficient: c.coefficient, couleur: PALETTE[i % PALETTE.length],
  }));

// La BD ne stocke ni enseignant, ni salle, ni durée, ni statut pour un créneau
const adaptEmploi = (rows = []) =>
  rows.map((e) => ({
    idTemps: e.idTemps,
    jour: e.jour,
    heure: normaliserHeure(e.heure),
    duree: 90,
    idClasse: e.classe?.idClasse,
    idCours: e.cours?.idCours,
    idPers: null,
    idSalle: null,
    status: 'normal',
  }));

// ── Constants ─────────────────────────────────────────────
const DISPLAY_SLOTS = [
  { label: '08:00', mins: 8 * 60 },
  { label: '09:30', mins: 9 * 60 + 30 },
  { label: '11:00', mins: 11 * 60 },      // break start
  { label: '11:15', mins: 11 * 60 + 15 },
  { label: '12:45', mins: 12 * 60 + 45 }, // lunch start
  { label: '14:00', mins: 14 * 60 },
  { label: '15:30', mins: 15 * 60 + 30 },
];
const DAY_START_MINS = 8 * 60;   // 08:00
const DAY_END_MINS = 17 * 60;  // 17:00
const DAY_SPAN = DAY_END_MINS - DAY_START_MINS; // 540 mins

const STATUS_META = {
  normal: { color: '#d86310', bg: 'rgba(216,99,16,0.1)', border: 'rgba(216,99,16,0.3)', label_key: 'sched_status_normal' },
  examen: { color: '#2563eb', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.3)', label_key: 'sched_status_examen' },
  annule: { color: '#8a7060', bg: 'rgba(138,112,96,0.1)', border: 'rgba(138,112,96,0.3)', label_key: 'sched_status_annule' },
  conflit: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#ef4444', label_key: 'sched_status_conflit' },
};

const DEPT_COLORS = {
  Sciences: '#d86310', Langues: '#7a3b1e', Humanités: '#ac3b02',
  Arts: '#d97706', Sport: '#16a34a', default: '#8a7060',
};

function timeToMins(heure) {
  const [h, m] = heure.split(':').map(Number);
  return h * 60 + m;
}

// ── Lookup helpers ────────────────────────────────────────
// Les tables de correspondance (classeMap, coursMap...) sont désormais
// construites à partir des données API dans le composant principal et
// passées aux sous-composants via la prop `lookups`.

// ── Sub-components ────────────────────────────────────────

function SegmentedFilter({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', background: '#f0ebe4', borderRadius: 12, padding: 3,
      gap: 2, border: '1px solid rgba(26,18,8,0.08)',
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 9, border: 'none',
          background: value === opt.value
            ? 'linear-gradient(135deg,#d86310,#ac3b02)'
            : 'transparent',
          color: value === opt.value ? 'white' : '#8a7060',
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
          boxShadow: value === opt.value ? '0 2px 8px rgba(216,99,16,0.3)' : 'none',
          whiteSpace: 'nowrap',
        }}>
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SelectDropdown({ options, value, onChange, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: '8px 32px 8px 12px', borderRadius: 10,
      border: '1.5px solid rgba(26,18,8,0.1)',
      background: '#faf9f7',
      fontSize: 13, color: '#1a1208', fontFamily: 'inherit',
      cursor: 'pointer', outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a7060' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function StatBadge({ icon, value, label, color = '#d86310' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', borderRadius: 10,
      background: 'rgba(216,99,16,0.07)',
      border: '1px solid rgba(216,99,16,0.18)',
    }}>
      <div style={{ color, fontSize: 16 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1208', fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: '#8a7060', marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

function BreakBand({ label, style = {} }) {
  return (
    <div style={{
      width: '100%', padding: '6px 12px',
      background: 'repeating-linear-gradient(45deg,rgba(26,18,8,0.03),rgba(26,18,8,0.03) 4px,transparent 4px,transparent 10px)',
      borderTop: '1px dashed rgba(26,18,8,0.1)',
      borderBottom: '1px dashed rgba(26,18,8,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <span style={{ fontSize: 10.5, fontWeight: 600, color: '#8a7060', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

function CourseBlock({ slot, viewMode, t, lookups, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const { coursMap, classeMap, enseignMap, salleMap } = lookups;
  const cours = coursMap[slot.idCours];
  const classe = classeMap[slot.idClasse];
  const enseignant = enseignMap[slot.idPers];
  const salle = salleMap[slot.idSalle];
  const meta = STATUS_META[slot.status] || STATUS_META.normal;
  const subjectColor = cours?.couleur || DEPT_COLORS.default;

  const startMins = timeToMins(slot.heure);
  const endMins = startMins + slot.duree;
  const endH = Math.floor(endMins / 60).toString().padStart(2, '0');
  const endM = (endMins % 60).toString().padStart(2, '0');
  const endTime = `${endH}:${endM}`;

  const isConflict = slot.status === 'conflit';
  const isAnnule = slot.status === 'annule';
  const isExamen = slot.status === 'examen';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: isAnnule
          ? 'repeating-linear-gradient(135deg,rgba(138,112,96,0.05),rgba(138,112,96,0.05) 4px,transparent 4px,transparent 8px)'
          : meta.bg,
        border: `1.5px ${isConflict ? 'dashed' : 'solid'} ${meta.border}`,
        borderLeft: `4px solid ${isConflict ? '#ef4444' : subjectColor}`,
        borderRadius: 10,
        padding: '8px 10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered
          ? `0 6px 18px ${isConflict ? 'rgba(239,68,68,0.2)' : 'rgba(216,99,16,0.15)'}`
          : '0 1px 4px rgba(26,18,8,0.06)',
        transform: hovered ? 'translateY(-1px) scale(1.01)' : 'none',
        overflow: 'hidden',
        minHeight: 72,
        opacity: isAnnule ? 0.65 : 1,
      }}
    >
      {/* Conflict icon */}
      {isConflict && (
        <div style={{ position: 'absolute', top: 6, right: 6, color: '#ef4444', fontSize: 13 }}>
          <FiAlertTriangle />
        </div>
      )}

      {/* Exam badge */}
      {isExamen && (
        <div style={{
          position: 'absolute', top: 5, right: isConflict ? 24 : 6,
          fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
          background: 'rgba(37,99,235,0.15)', color: '#2563eb',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {t.sched_status_examen}
        </div>
      )}

      {/* Subject name */}
      <div style={{
        fontSize: 12.5, fontWeight: 700, color: isAnnule ? '#8a7060' : '#1a1208',
        lineHeight: 1.25, marginBottom: 4,
        textDecoration: isAnnule ? 'line-through' : 'none',
        paddingRight: isConflict || isExamen ? 20 : 0,
      }}>
        {cours?.libelle}
      </div>

      {/* Context sub-data */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {viewMode !== 'teacher' && enseignant && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: `linear-gradient(135deg,${enseignant.couleur}bb,${enseignant.couleur})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {enseignant.initiales}
            </div>
            <span style={{ fontSize: 10.5, color: '#4a3728', fontWeight: 500, lineHeight: 1.2 }}>
              {enseignant.prenom} {enseignant.nom}
            </span>
          </div>
        )}
        {viewMode !== 'class' && classe && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MdOutlineClass style={{ fontSize: 11, color: '#8a7060', flexShrink: 0 }} />
            <span style={{ fontSize: 10.5, color: '#4a3728', fontWeight: 500 }}>{classe.libelle}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FiMapPin style={{ fontSize: 10, color: '#8a7060', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#8a7060' }}>{salle?.libelle}</span>
          <span style={{ fontSize: 10, color: '#8a7060', marginLeft: 4 }}>
            · {slot.heure}–{endTime}
          </span>
        </div>
      </div>

      {/* Hover action */}
      {hovered && !isAnnule && (
        <div style={{
          position: 'absolute', bottom: 6, right: 6,
          display: 'flex', gap: 4,
        }}>
          <button
            onClick={e => { e.stopPropagation(); onDelete && onDelete(slot); }}
            title="Supprimer ce créneau"
            style={{
              width: 24, height: 24, borderRadius: 6, border: 'none',
              background: 'rgba(239,68,68,0.15)',
              color: '#ef4444',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
            }}>
            <FiTrash2 />
          </button>
        </div>
      )}

      {/* Annulé watermark */}
      {isAnnule && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 800, color: '#8a7060', letterSpacing: '0.12em',
            textTransform: 'uppercase', opacity: 0.5, transform: 'rotate(-20deg)',
          }}>
            {t.sched_status_annule}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Desktop grid ─────────────────────────────────────────
function DesktopGrid({ filteredSlots, viewMode, t, lookups, onDelete }) {
  // Time axis: fixed row heights proportional to minutes
  const CELL_HEIGHT = 64; // px per slot row

  const timeRows = [
    { label: '08:00', mins: 480, isBreak: false },
    { label: '09:30', mins: 570, isBreak: false },
    { label: '11:00', mins: 660, isBreak: true, breakKey: 'break_recre' },
    { label: '11:15', mins: 675, isBreak: false },
    { label: '12:45', mins: 765, isBreak: true, breakKey: 'break_dejeuner' },
    { label: '14:00', mins: 840, isBreak: false },
    { label: '15:30', mins: 930, isBreak: false },
  ];

  const dayKeys = {
    Lundi: 'lundi', Mardi: 'mardi', Mercredi: 'mercredi',
    Jeudi: 'jeudi', Vendredi: 'vendredi', Samedi: 'samedi',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 860 }}>
        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '64px repeat(6, 1fr)',
          gap: 6, marginBottom: 6,
        }}>
          <div /> {/* time axis spacer */}
          {JOURS.map(jour => (
            <div key={jour} style={{
              textAlign: 'center', padding: '8px 4px', borderRadius: 10,
              background: 'linear-gradient(135deg,#d86310,#ac3b02)',
              boxShadow: '0 2px 8px rgba(216,99,16,0.25)',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'white' }}>
                {t[`sched_day_${dayKeys[jour]}`]}
              </div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {timeRows.map((row, ri) => {
          if (row.isBreak) {
            return (
              <div key={row.label} style={{
                display: 'grid',
                gridTemplateColumns: '64px repeat(6, 1fr)',
                gap: 6, marginBottom: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                  <span style={{ fontSize: 9.5, color: '#8a7060', letterSpacing: '0.04em' }}>{row.label}</span>
                </div>
                <div style={{ gridColumn: '2 / -1' }}>
                  <BreakBand label={t[row.breakKey]} />
                </div>
              </div>
            );
          }

          const nextRow = timeRows[ri + 1];
          const slotDuration = nextRow ? nextRow.mins - row.mins : 90;
          const rowH = Math.max(slotDuration * 0.9, CELL_HEIGHT);

          return (
            <div key={row.label} style={{
              display: 'grid',
              gridTemplateColumns: '64px repeat(6, 1fr)',
              gap: 6, marginBottom: 4,
              minHeight: rowH,
            }}>
              {/* Time label */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                paddingRight: 8, paddingTop: 4,
              }}>
                <span style={{ fontSize: 10, color: '#8a7060', fontWeight: 600 }}>{row.label}</span>
              </div>

              {/* Day cells */}
              {JOURS.map(jour => {
                const blocks = filteredSlots.filter(
                  s => s.jour === jour && s.heure === row.label
                );
                return (
                  <div key={jour} style={{
                    background: 'rgba(26,18,8,0.02)',
                    borderRadius: 8,
                    border: '1px solid rgba(26,18,8,0.05)',
                    padding: blocks.length ? 0 : 4,
                    minHeight: rowH,
                    position: 'relative',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    {blocks.length === 0 ? null : (
                      blocks.map(slot => (
                        <CourseBlock key={slot.idTemps} slot={slot} viewMode={viewMode} t={t} lookups={lookups} onDelete={onDelete} />
                      ))
                    )}
                    {blocks.length === 0 && (
                      <div style={{
                        flex: 1,
                        background: 'repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(26,18,8,0.015) 8px,rgba(26,18,8,0.015) 9px)',
                        borderRadius: 6,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mobile daily view ─────────────────────────────────────
function MobileView({ filteredSlots, selectedDay, setSelectedDay, viewMode, t, lookups, onDelete }) {
  const dayKeys = {
    Lundi: 'lundi', Mardi: 'mardi', Mercredi: 'mercredi',
    Jeudi: 'jeudi', Vendredi: 'vendredi', Samedi: 'samedi',
  };

  const daySlots = filteredSlots
    .filter(s => s.jour === selectedDay)
    .sort((a, b) => timeToMins(a.heure) - timeToMins(b.heure));

  const breaks = {
    '11:00': 'break_recre',
    '12:45': 'break_dejeuner',
  };

  const allSlotTimes = ['08:00', '09:30', '11:00', '11:15', '12:45', '14:00', '15:30'];

  return (
    <div>
      {/* Day selector */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16,
      }}>
        {JOURS.map(jour => {
          const count = filteredSlots.filter(s => s.jour === jour).length;
          const active = selectedDay === jour;
          return (
            <button key={jour} onClick={() => setSelectedDay(jour)} style={{
              flexShrink: 0,
              padding: '8px 14px', borderRadius: 10, border: 'none',
              background: active ? 'linear-gradient(135deg,#d86310,#ac3b02)' : '#f0ebe4',
              color: active ? 'white' : '#8a7060',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              position: 'relative',
              boxShadow: active ? '0 2px 8px rgba(216,99,16,0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
              {t[`sched_day_short_${dayKeys[jour]}`]}
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: active ? 'white' : '#d86310',
                  color: active ? '#d86310' : 'white',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${active ? '#d86310' : '#f5f0ea'}`,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allSlotTimes.map(time => {
          if (breaks[time]) {
            return <BreakBand key={time} label={t[breaks[time]]} style={{ borderRadius: 8 }} />;
          }
          const slots = daySlots.filter(s => s.heure === time);
          if (slots.length === 0) return null;
          return (
            <div key={time} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#8a7060', width: 40, paddingTop: 10, flexShrink: 0 }}>{time}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {slots.map(slot => (
                  <CourseBlock key={slot.idTemps} slot={slot} viewMode={viewMode} t={t} lookups={lookups} onDelete={onDelete} />
                ))}
              </div>
            </div>
          );
        })}
        {daySlots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#8a7060', fontSize: 13 }}>
            <FiCalendar style={{ fontSize: 32, margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
            {t.sched_empty}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function SchedulePage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { anneeId, anneeLibelle } = useActiveYear();

  const [viewMode, setViewMode] = useState('class');    // 'class' | 'teacher' | 'room'
  const [selectedFilter, setSelectedFilter] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState('Lundi');
  const [isMobile, setIsMobile] = useState(false);

  // Données chargées depuis l'API
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);
  const [cours, setCours] = useState([]);
  const [emploi, setEmploi] = useState([]);
  const [error, setError] = useState('');

  // Édition : modal d'ajout de créneau
  const [addOuvert, setAddOuvert] = useState(false);
  const [creneauForm, setCreneauForm] = useState({ idClasse: '', idCours: '', jour: 'Lundi', heure: '08:00' });
  const [envoiCreneau, setEnvoiCreneau] = useState(false);
  const [creneauErreur, setCreneauErreur] = useState('');

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const [c, e, s, co, em] = await Promise.all([
          getClasses(), getEnseignants(), getSalles(), getCours(), getEmploi(),
        ]);
        if (!actif) return;
        setClasses(adaptClasses(c));
        setEnseignants(adaptEnseignants(e));
        setSalles(adaptSalles(s));
        setCours(adaptCours(co));
        setEmploi(adaptEmploi(em));
      } catch (err) {
        if (actif) setError(err.message || "Erreur de chargement de l'emploi du temps.");
      }
    })();
    return () => { actif = false; };
  }, []);

  // Tables de correspondance pour les sous-composants
  const lookups = useMemo(() => ({
    classeMap: Object.fromEntries(classes.map(c => [c.idClasse, c])),
    enseignMap: Object.fromEntries(enseignants.map(e => [e.idPers, e])),
    salleMap: Object.fromEntries(salles.map(s => [s.idSalle, s])),
    coursMap: Object.fromEntries(cours.map(c => [c.idCours, c])),
  }), [classes, enseignants, salles, cours]);

  // Recharge uniquement les créneaux (après ajout/suppression)
  const rechargerEmploi = async () => {
    try {
      const em = await getEmploi();
      setEmploi(adaptEmploi(em));
    } catch (err) {
      setError(err.message || 'Erreur de rechargement.');
    }
  };

  // Supprimer un créneau
  const supprimerCreneau = async (slot) => {
    if (typeof window !== 'undefined' && !window.confirm('Supprimer ce créneau ?')) return;
    setError('');
    try {
      await deleteEmploi(slot.idTemps);
      await rechargerEmploi();
    } catch (err) {
      setError(err.message || 'Suppression impossible.');
    }
  };

  // Ajouter un créneau (avec détection de conflits)
  const ajouterCreneau = async (ev) => {
    ev.preventDefault();
    setCreneauErreur('');
    const { idClasse, idCours, jour, heure } = creneauForm;
    if (!idClasse || !idCours) {
      setCreneauErreur('Classe et cours sont obligatoires.');
      return;
    }
    const payload = {
      jour,
      heure,
      idClasse: Number(idClasse),
      idCours: Number(idCours),
      idAdmin: user?.role === 'admin' && user?.id ? Number(user.id) : undefined,
    };
    setEnvoiCreneau(true);
    try {
      // 1) Vérifier les conflits côté serveur
      const res = await verifierConflitsEmploi(payload);
      if (res?.hasConflict) {
        setCreneauErreur('Conflit : ' + (res.conflicts || []).join(' · '));
        return;
      }
      // 2) Créer le créneau
      await createEmploi(payload);
      setAddOuvert(false);
      setCreneauForm({ idClasse: '', idCours: '', jour: 'Lundi', heure: '08:00' });
      await rechargerEmploi();
    } catch (err) {
      setCreneauErreur(err.message || "Échec de l'ajout du créneau.");
    } finally {
      setEnvoiCreneau(false);
    }
  };

  // Detect mobile
  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches !== isMobile) setIsMobile(mq.matches);
  }

  // Filter options per mode
  const filterOptions = useMemo(() => {
    if (viewMode === 'class') return classes.map(c => ({ value: String(c.idClasse), label: c.libelle }));
    if (viewMode === 'teacher') return enseignants.map(e => ({ value: String(e.idPers), label: `${e.prenom} ${e.nom}` }));
    if (viewMode === 'room') return salles.map(s => ({ value: String(s.idSalle), label: s.libelle }));
    return [];
  }, [viewMode, classes, enseignants, salles]);

  // Filtered schedule entries.
  // ⚠️ Un créneau ne stocke QUE la classe (ni enseignant ni salle) : pour les
  // vues "enseignant" et "salle", on dérive la classe (enseignant→classe,
  // salle→classe) puis on filtre les créneaux de cette classe.
  const filteredSlots = useMemo(() => {
    if (!selectedFilter) return []; // rien tant qu'aucune sélection
    if (viewMode === 'class') {
      return emploi.filter(s => String(s.idClasse) === selectedFilter);
    }
    if (viewMode === 'teacher') {
      const ens = enseignants.find(e => String(e.idPers) === selectedFilter);
      const idC = ens?.idClasse;
      return idC ? emploi.filter(s => Number(s.idClasse) === Number(idC)) : [];
    }
    if (viewMode === 'room') {
      const salle = salles.find(s => String(s.idSalle) === selectedFilter);
      const idC = salle?.idClasse;
      return idC ? emploi.filter(s => Number(s.idClasse) === Number(idC)) : [];
    }
    return [];
  }, [viewMode, selectedFilter, emploi, enseignants, salles]);

  const aucuneSelection = !selectedFilter;

  const titreSelection = () => {
    if (viewMode === 'class') return `Classe ${classes.find(c => String(c.idClasse) === selectedFilter)?.libelle || ''}`;
    if (viewMode === 'teacher') { const e = enseignants.find(x => String(x.idPers) === selectedFilter); return e ? `Enseignant ${e.prenom} ${e.nom}` : ''; }
    if (viewMode === 'room') return `Salle ${salles.find(s => String(s.idSalle) === selectedFilter)?.libelle || ''}`;
    return '';
  };

  const handleImprimer = () => {
    if (aucuneSelection) { setError("Sélectionnez d'abord une classe, un enseignant ou une salle."); return; }
    imprimerEmploi({
      titre: titreSelection(),
      jours: JOURS,
      heures: HEURES_CRENEAUX,
      cellule: (jour, heure) => {
        const s = filteredSlots.find(x => x.jour === jour && x.heure === heure);
        return s ? (lookups.coursMap[s.idCours]?.libelle || 'Cours') : '';
      },
    });
  };

  const handleExporter = () => {
    if (aucuneSelection) { setError("Sélectionnez d'abord une classe, un enseignant ou une salle."); return; }
    const rows = filteredSlots.slice().sort(
      (a, b) => (JOURS.indexOf(a.jour) - JOURS.indexOf(b.jour)) || (timeToMins(a.heure) - timeToMins(b.heure)),
    );
    exporterCSV(rows, [
      { label: 'Jour', get: (r) => r.jour },
      { label: 'Heure', get: (r) => r.heure },
      { label: 'Cours', get: (r) => lookups.coursMap[r.idCours]?.libelle || '' },
      { label: 'Classe', get: (r) => lookups.classeMap[r.idClasse]?.libelle || '' },
    ], 'emploi_du_temps.csv');
  };

  // Weekly stats
  const weeklyHours = Math.round(filteredSlots.reduce((acc, s) => acc + (s.duree / 60), 0) * 10) / 10;
  const conflictCount = filteredSlots.filter(s => s.status === 'conflit').length;

  // Week label
  const now = new Date();
  now.setDate(now.getDate() + weekOffset * 7);
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekLabel = monday.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long' });

  const filterModes = [
    { value: 'class', label: t.sched_mode_class, icon: <MdOutlineClass style={{ fontSize: 14 }} /> },
    { value: 'teacher', label: t.sched_mode_teacher, icon: <BsPersonFill style={{ fontSize: 13 }} /> },
    { value: 'room', label: t.sched_mode_room, icon: <MdOutlineMeetingRoom style={{ fontSize: 14 }} /> },
  ];

  const handleModeChange = (mode) => {
    setViewMode(mode);
    setSelectedFilter('');
  };

  const filterPlaceholder =
    viewMode === 'class' ? t.sched_mode_class :
      viewMode === 'teacher' ? t.sched_mode_teacher :
        t.sched_mode_room;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f0ea 0%,#ede8e0 100%)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>

      {/* ── PAGE HEADER ───────────────────────────── */}
      <div style={{
        background: 'rgba(245,240,234,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(216,99,16,0.1)',
        padding: '18px 28px 14px', position: 'sticky', top: 0, zIndex: 90,
        boxShadow: '0 2px 12px rgba(26,18,8,0.05)',
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#d86310,#7a3b1e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(216,99,16,0.3)',
              }}>
                <BsCalendar3 style={{ color: 'white', fontSize: 16 }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 700, color: '#1a1208', lineHeight: 1.1 }}>
                  {t.sched_title}
                </h1>
                <p style={{ fontSize: 12, color: '#8a7060', marginTop: 1 }}>{t.sched_sub}</p>
              </div>
            </div>
          </div>

          {/* Export actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setCreneauErreur(''); setAddOuvert(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9, border: 'none',
                background: 'linear-gradient(135deg,#d86310,#ac3b02)', color: 'white',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(216,99,16,0.3)',
              }}
            >
              <FiPlus /> <span style={{ display: isMobile ? 'none' : 'inline' }}>Ajouter un créneau</span>
            </button>
            {[
              { icon: <FiPrinter />, label: t.sched_print, onClick: handleImprimer },
              { icon: <FiDownload />, label: t.sched_export, onClick: handleExporter },
            ].map(btn => (
              <button key={btn.label} title={btn.label} onClick={btn.onClick} disabled={aucuneSelection} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9,
                border: '1.5px solid rgba(26,18,8,0.1)',
                background: '#faf9f7', color: aucuneSelection ? '#c4b8b0' : '#4a3728',
                fontSize: 12, fontWeight: 600, cursor: aucuneSelection ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (aucuneSelection) return; e.currentTarget.style.borderColor = '#d86310'; e.currentTarget.style.color = '#d86310'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,18,8,0.1)'; e.currentTarget.style.color = aucuneSelection ? '#c4b8b0' : '#4a3728'; }}
              >
                {btn.icon} <span style={{ display: isMobile ? 'none' : 'inline' }}>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Segmented filter mode */}
          <SegmentedFilter options={filterModes} value={viewMode} onChange={handleModeChange} />

          {/* Entity selector */}
          <SelectDropdown
            options={filterOptions}
            value={selectedFilter}
            onChange={setSelectedFilter}
            placeholder={filterPlaceholder}
          />

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'rgba(26,18,8,0.1)', margin: '0 4px' }} />

          {/* Week navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={{
              width: 32, height: 32, borderRadius: 8, border: '1.5px solid rgba(26,18,8,0.1)',
              background: '#faf9f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a3728',
            }}>
              <FiChevronLeft />
            </button>

            <div style={{
              padding: '5px 12px', borderRadius: 8,
              background: 'rgba(216,99,16,0.08)', border: '1px solid rgba(216,99,16,0.2)',
              fontSize: 12, fontWeight: 600, color: '#d86310', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <FiCalendar style={{ fontSize: 11 }} />
              {t.sched_week_of} {weekLabel}
            </div>

            <button onClick={() => setWeekOffset(w => w + 1)} style={{
              width: 32, height: 32, borderRadius: 8, border: '1.5px solid rgba(26,18,8,0.1)',
              background: '#faf9f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a3728',
            }}>
              <FiChevronRight />
            </button>

            <button onClick={() => setWeekOffset(0)} style={{
              padding: '5px 10px', borderRadius: 8,
              border: '1.5px solid rgba(26,18,8,0.1)',
              background: weekOffset === 0 ? 'rgba(216,99,16,0.1)' : '#faf9f7',
              color: weekOffset === 0 ? '#d86310' : '#8a7060',
              fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {t.sched_today}
            </button>
          </div>

          {/* Stats badges */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <StatBadge icon={<FiClock />} value={`${weeklyHours}h`} label={t.sched_weekly_hours} />
            <StatBadge icon={<FiBookOpen />} value={filteredSlots.length} label={t.sched_total_blocks} />
            {conflictCount > 0 && (
              <StatBadge icon={<FiAlertTriangle />} value={conflictCount} label={t.sched_status_conflit} color="#ef4444" />
            )}
          </div>
        </div>
      </div>

      {/* ── LEGEND ────────────────────────────────── */}
      <div style={{ padding: '10px 28px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: meta.color, opacity: 0.85,
              border: key === 'conflit' ? '1px dashed #ef4444' : 'none',
            }} />
            <span style={{ fontSize: 11, color: '#8a7060' }}>{t[meta.label_key]}</span>
          </div>
        ))}
      </div>

      {/* Bandeau erreur de chargement */}
      {error && (
        <div style={{
          margin: '10px 28px 0', padding: '12px 16px', borderRadius: 12,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#dc2626', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* ── GRID / MOBILE VIEW ────────────────────── */}
      <div style={{ padding: '14px 28px 32px' }}>
        {aucuneSelection ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            border: '1px solid rgba(26,18,8,0.07)', boxShadow: '0 4px 20px rgba(26,18,8,0.06)',
            textAlign: 'center', color: '#8a7060',
          }}>
            <BsCalendar3 style={{ fontSize: 34, opacity: 0.4, marginBottom: 10 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4a3728' }}>
              Choisissez {viewMode === 'class' ? 'une classe' : viewMode === 'teacher' ? 'un enseignant' : 'une salle'} pour afficher l'emploi du temps
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Sélectionnez le mode (classe / enseignant / salle) puis l'élément voulu dans la liste ci-dessus.
            </div>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div style={{ display: isMobile ? 'none' : 'block' }}>
              <div style={{
                background: '#fff', borderRadius: 20, padding: '20px',
                border: '1px solid rgba(26,18,8,0.07)',
                boxShadow: '0 4px 20px rgba(26,18,8,0.06)',
              }}>
                <DesktopGrid filteredSlots={filteredSlots} viewMode={viewMode} t={t} lookups={lookups} onDelete={supprimerCreneau} />
              </div>
            </div>

            {/* Mobile */}
            <div style={{ display: isMobile ? 'block' : 'none' }}>
              <div style={{
                background: '#fff', borderRadius: 20, padding: '16px',
                border: '1px solid rgba(26,18,8,0.07)',
                boxShadow: '0 4px 20px rgba(26,18,8,0.06)',
              }}>
                <MobileView
                  filteredSlots={filteredSlots}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  viewMode={viewMode}
                  t={t}
                  lookups={lookups}
                  onDelete={supprimerCreneau}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modal : ajouter un créneau ── */}
      {addOuvert && (
        <div
          onClick={() => !envoiCreneau && setAddOuvert(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}
        >
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1208', fontFamily: "'Playfair Display',serif" }}>
                Ajouter un créneau
              </h2>
              <button onClick={() => !envoiCreneau && setAddOuvert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7060' }}>
                <FiX size={20} />
              </button>
            </div>

            {classes.length === 0 || cours.length === 0 ? (
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(216,99,16,0.08)', border: '1px solid rgba(216,99,16,0.2)', color: '#ac3b02', fontSize: 13 }}>
                Il faut au moins une <b>classe</b> et un <b>cours</b> en base pour créer un créneau. (Gestion des classes/cours à venir.)
              </div>
            ) : (
              <form onSubmit={ajouterCreneau} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6 }}>Classe *</label>
                  <select value={creneauForm.idClasse} onChange={(e) => setCreneauForm(f => ({ ...f, idClasse: e.target.value }))} style={selectStyle}>
                    <option value="">— Choisir —</option>
                    {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6 }}>Cours *</label>
                  <select value={creneauForm.idCours} onChange={(e) => setCreneauForm(f => ({ ...f, idCours: e.target.value }))} style={selectStyle}>
                    <option value="">— Choisir —</option>
                    {cours.map(c => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6 }}>Jour *</label>
                    <select value={creneauForm.jour} onChange={(e) => setCreneauForm(f => ({ ...f, jour: e.target.value }))} style={selectStyle}>
                      {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a3728', marginBottom: 6 }}>Heure *</label>
                    <select value={creneauForm.heure} onChange={(e) => setCreneauForm(f => ({ ...f, heure: e.target.value }))} style={selectStyle}>
                      {HEURES_CRENEAUX.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                {creneauErreur && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 }}>
                    {creneauErreur}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 6 }}>
                  <button type="button" onClick={() => setAddOuvert(false)} disabled={envoiCreneau} style={{ padding: '11px 20px', borderRadius: 12, border: '1.5px solid rgba(26,18,8,0.1)', background: '#faf9f7', color: '#4a3728', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={envoiCreneau} style={{ padding: '11px 24px', borderRadius: 12, border: 'none', background: envoiCreneau ? 'rgba(216,99,16,0.6)' : 'linear-gradient(135deg,#d86310,#ac3b02)', color: 'white', fontSize: 14, fontWeight: 600, cursor: envoiCreneau ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    {envoiCreneau ? 'Ajout…' : 'Ajouter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}