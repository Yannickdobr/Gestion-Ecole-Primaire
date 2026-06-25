---
name: brightschool
description: "BrightSchool Director pages — Complete development guide covering architecture, design system, internationalization, mock data patterns, component patterns, styling methodology, and production quality standards. Use this for all pages to maintain visual and functional consistency."
scope: "Next.js 14 (App Router) React dashboard • Bilingual FR/EN • Mock data (replaces with API) • Production-grade UI"
license: Proprietary. PROJECT_CONTEXT.md contains full project state.
---

# BrightSchool Dashboard — Developer Skill Guide

## 1. PROJECT OVERVIEW & ARCHITECTURE

### Tech Stack (IMMUTABLE)
```
Framework:      Next.js 14 (App Router, SSR-capable)
UI Library:     React 18 with Hooks
Styling:        Inline styles (CSS-in-JS) or CSS properties + Tailwind utilities (optional)
Charts:         Recharts (for Analytics/Performance pages)
Icons:          React Icons (FiXXX, MdXXX, BsXXX) + Lucide React
State:          React Context (useLanguage) + useState (local UI state)
Database:       MySQL (Ecole-primaire.sql schema) — not yet integrated
Deployment:     Next.js production build
```

### Database Schema Reference (KEY TABLES)
All mock data MUST respect the schema in the sql database

---

## 2. DESIGN SYSTEM & VISUAL IDENTITY

### Color Palette (EXACT HEX CODES — Copy & Paste)

**Primary Accents**
```css
--orange-primary:       #d86310   /* Main CTA, highlights, active states */
--orange-dark:          #ac3b02   /* Gradient end, secondary */
--brown-primary:        #7a3b1e   /* Secondary text, buttons */
--brown-dark:           #4a3728   /* Tertiary, deep accents */
--taupe:                #8a7060   /* Muted text, inactive */
```

**Backgrounds & Neutrals**
```css
--cream:                #f5f0ea   /* Page background (main) */
--cream-darker:         #ede8e0   /* Page background (alternate) */
--white:                #ffffff   /* Cards, modals */
--off-white:            #faf9f7   /* Input fields, subtle elements */
--text-dark:            #1a1208   /* Primary text (headings, body) */
--text-mid:             #4a3728   /* Secondary text */
--text-light:           #8a7060   /* Muted/disabled text */
```

**Semantic Colors**
```css
--success:              #16a34a   /* Approvals, valid states */
--warning:              #d97706   /* Cautions, updates */
--error:                #ef4444   /* Conflicts, deletions, critical */
--info:                 #2563eb   /* Exams, important info */
--danger-red:           #dc2626   /* High-alert, discipline */
```

**Gradients (Common)**
```css
/* Sidebar */
linear-gradient(175deg, #d86310 0%, #ac3b02 38%, #7a3b1e 72%, #4a3728 100%)

/* Primary buttons */
linear-gradient(135deg, #d86310, #ac3b02)

/* Subtle background wash (KPI cards) */
radial-gradient(ellipse at top right, rgba(216,99,16,0.08), rgba(216,99,16,0))

/* Chart fills */
<linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%" stopColor="#d86310" stopOpacity={0.25} />
  <stop offset="95%" stopColor="#d86310" stopOpacity={0.02} />
</linearGradient>
```

### Typography

**Font Stack**
```
Display/Headings:   'Playfair Display', Georgia, serif
Body/UI:            'DM Sans', system-ui, sans-serif
```

**Font Weight Scale**
```
Regular:            400
Medium:             500
SemiBold:           600
Bold:               700
ExtraBold:          800
```

**Size Scale (px)**
```
9, 10, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48
Use exact values — no "medium", "large" words
```

**Examples**
```jsx
// Heading (display)
style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1a1208' }}

// Body text
style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: '#4a3728', lineHeight: 1.6 }}

// Label/Meta
style={{ fontSize: 11, color: '#8a7060', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
```

### Spacing Scale (MANDATORY)

```
4px   = 1 unit (micro gaps, icon spacing)
8px   = 2 units
12px  = 3 units (standard gap between elements)
16px  = 4 units (card internal padding)
20px  = 5 units (padding inside cards)
24px  = 6 units (section padding, padding around groups)
28px  = 7 units (page-level padding, container spacing)
32px  = 8 units (header/large container padding)
```

**Rule:** Always use the scale. Never use arbitrary values like "13px", "17px", etc.

```jsx
// ✓ CORRECT
style={{ gap: 12, padding: '20px 24px', marginBottom: 16 }}

// ✗ WRONG
style={{ gap: 13, padding: '18px 22px', marginBottom: 15 }}
```

### Shadows (Consistent Hierarchy)

```
Subtle (cards, default state):
  0 2px 12px rgba(26,18,8,0.05)

Medium (hover state, lifted cards):
  0 8px 24px rgba(216,99,16,0.13), 0 2px 8px rgba(26,18,8,0.06)

Strong (modals, overlays, prominence):
  0 8px 28px rgba(216,99,16,0.35)

Inset (depth inside containers):
  inset 0 1px 3px rgba(26,18,8,0.08)

Glow (active badges, indicators):
  0 0 8px rgba(216,99,16,0.5)
```

### Border Radius

```
Small buttons, inputs:  8–10px
Cards, sections:        16–20px (typically 20px)
Full circle:            999px (for badges, avatars)
Slightly rounded:       12–14px
```

---

## 3. INTERNATIONALIZATION (BILINGUAL FR/EN)

### Language System Architecture

**Context Hook**
```javascript
import { useLanguage } from '@/context/LanguageContext';

// Returns { lang: 'fr' | 'en', setLang: function }
const { lang } = useLanguage();
```

**Translation Dictionary**
```
Location: src/messages/en.js and src/messages/fr.js
Structure: { en: { key: 'English text', ... }, fr: { key: 'Texte français', ... } }
```

### ZERO HARDCODED STRINGS RULE

**✗ FORBIDDEN**
```jsx
<h1>Emploi du Temps</h1>
<button>Semaine Précédente</button>
<span>Aucune séance planifiée</span>
```

**✓ MANDATORY**
```jsx
// First: Add to dashboardLanguage.js
// en: { sched_title: 'Master Schedule', sched_prev_week: 'Previous week', sched_empty: 'No sessions...' }
// fr: { sched_title: 'Emploi du Temps', sched_prev_week: 'Semaine précédente', sched_empty: 'Aucune séance...' }

// Then: Use in component
const { lang } = useLanguage();

<h1>{t.sched_title}</h1>
<button>{t.sched_prev_week}</button>
<span>{t.sched_empty}</span>
```

### Naming Convention for Keys

```
Pattern: {feature}_{element}_{descriptor}

Examples:
  sched_title            ← Schedule page, main title
  sched_prev_week        ← Schedule page, previous week button
  sched_status_examen    ← Schedule page, status label "Exam"
  
  courses_filter_by_dept ← Courses page, filter dropdown for department
  courses_btn_add        ← Courses page, "Add Course" button
  
  staff_status_present   ← Staff page, status indicator "Present"
  staff_role_teacher     ← Staff page, role label
  
  break_recre            ← Break type, "Recreation break"
  break_dejeuner         ← Break type, "Lunch break"
```

**Guidance**
- Be **specific**: `pupils_card_average` not `pupils_grade`
- Be **consistent**: All schedule items start with `sched_`, all buttons end with `_btn` or `_action`
- Be **concise**: `filter_by_class` not `filter_the_schedule_by_specific_class`

---

## 4. MOCK DATA STRATEGY

### Core Principle

**All data lives in `src/data/[feature]MockData.js`.** Components NEVER contain inline test data. When API is ready, swap data source without touching component code.

### Mock Data Structure Pattern

```javascript
// ── directorMockData.js ──────────────────────────────────
export const mockDirecteur = { /* ... */ };
export const mockKPIs = { /* ... */ };
export const mockAnnonces = [ /* ... */ ];

// ── scheduleMockData.js ──────────────────────────────────
export const mockClasses = [ /* ... */ ];
export const mockEnseignants = [ /* ... */ ];
export const mockSalles = [ /* ... */ ];
export const mockCours = [ /* ... */ ];
export const mockEmploiDuTemps = [ /* ... */ ];
export const SCHOOL_BREAKS = [ /* ... */ ];

// ── coursesMockData.js (template for next feature) ──────
export const mockCourses = [ /* ... */ ];
export const mockDepartments = [ /* ... */ ];
export const mockTeacherAssignments = [ /* ... */ ];
```

### Field Naming Requirement

**MUST match SQL schema field names exactly** so API replacement is drop-in:

```javascript
// ✓ CORRECT (matches Cours table)
{ idCours: 1, libelle: 'Mathématiques', coefficient: 3, idClasse: 5 }

// ✗ WRONG (invented field names)
{ id: 1, name: 'Math', weight: 3, classId: 5 }
```

### Mock Data with Computed Fields

When mock data needs extra fields for UI (not in DB), prefix with `_` or use top-level helpers:

```javascript
// ✓ ACCEPTABLE
export const mockCourses = [
  {
    idCours: 1,
    libelle: 'Mathématiques',
    coefficient: 3,
    // UI-only fields
    _couleur: '#d86310',      // color for display
    _departement: 'Sciences',
    _avancement: 68,          // computed percentage
  }
];

// Or use a helper map
const COURSE_COLORS = { 1: '#d86310', 2: '#7a3b1e', ... };
const courseColor = COURSE_COLORS[course.idCours];
```

### Creating Mock Data Checklist

When creating a new `[feature]MockData.js`:

```
□ Mirror ALL SQL schema fields exactly
□ Use realistic data (French names, proper emails, valid dates)
□ Include enough entries to test pagination (8–15 items minimum)
□ Add edge cases (empty states, conflicts, warnings)
□ Include initials/couleur for avatar rendering (standard fields across all mocks)
□ Document the data source table reference in a comment
□ Export with descriptive names (mockXxx, not just data or items)
□ Add any fixed data needed (e.g., SCHOOL_BREAKS, DEPT_COLORS)
```

### Phase-Based Data Source Evolution

```
PHASE 1 (Now):       Mock data in directorMockData.js, scheduleMockData.js, etc.
PHASE 2 (Week 2):    API endpoint returns same shape → swap import, same components work
PHASE 3 (Week 3):    Add auth, caching, error handling
PHASE 4 (Week 4+):   Real database queries, pagination, filtering server-side
```

---

## 5. REUSABLE COMPONENT PATTERNS

### Pattern 1: Card Wrapper

**Purpose:** Consistent container for content sections

```jsx
function Card({ children, style = {}, hover = true, accent = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        border: `1px solid ${hovered ? 'rgba(216,99,16,0.22)' : 'rgba(26,18,8,0.07)'}`,
        boxShadow: hovered
          ? '0 12px 36px rgba(216,99,16,0.13), 0 2px 8px rgba(26,18,8,0.06)'
          : '0 2px 12px rgba(26,18,8,0.05)',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease',
        transform: hovered && hover ? 'translateY(-2px)' : 'translateY(0)',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        ...(accent && { borderTop: '3px solid #d86310' }),
        ...style,
      }}
    >
      {/* Subtle top shine */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  );
}

// Usage
<Card accent style={{ padding: '18px' }}>
  <h2>{t.section_title}</h2>
  {content}
</Card>
```

### Pattern 2: Section with Scroll Animation

**Purpose:** Fade + slide-up on scroll visibility

```jsx
function Section({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Usage
<Section delay={60}>
  <Card>{content}</Card>
</Section>
```

### Pattern 3: Animated Counter

**Purpose:** Number tween on component mount

```jsx
function AnimatedNumber({ target, suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // ease-out-cubic
      setVal(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return <>{val}{suffix}</>;
}

// Usage
<div style={{ fontSize: '2rem', fontWeight: 800 }}>
  <AnimatedNumber target={312} suffix=" élèves" />
</div>
```

### Pattern 4: Segmented Control / Tab Filter

**Purpose:** Multi-option selection UI

```jsx
function SegmentedFilter({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', background: '#f0ebe4', borderRadius: 12, padding: 3,
      gap: 2, border: '1px solid rgba(26,18,8,0.08)',
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          padding: '7px 14px', borderRadius: 9, border: 'none',
          background: value === opt.value
            ? 'linear-gradient(135deg,#d86310,#ac3b02)'
            : 'transparent',
          color: value === opt.value ? 'white' : '#8a7060',
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all 0.2s',
          boxShadow: value === opt.value ? '0 2px 8px rgba(216,99,16,0.3)' : 'none',
        }}>
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}

// Usage
<SegmentedFilter
  options={[
    { value: 'week', label: 'Week', icon: <FiCalendar /> },
    { value: 'month', label: 'Month', icon: <FiCalendar /> },
  ]}
  value={selectedRange}
  onChange={setSelectedRange}
/>
```

### Pattern 5: Status Badge / Pill

**Purpose:** Small label/indicator

```jsx
function Badge({ value, label, color = '#d86310', icon = null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 999,
      background: `rgba(${color === '#d86310' ? '216,99,16' : '122,59,30'},0.1)`,
      border: `1px solid rgba(${color === '#d86310' ? '216,99,16' : '122,59,30'},0.25)`,
      width: 'fit-content',
    }}>
      {icon && <span style={{ color, fontSize: 12 }}>{icon}</span>}
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
      {label && <span style={{ fontSize: 10, color: '#8a7060' }}>— {label}</span>}
    </div>
  );
}

// Usage
<Badge value={5} label="pending" icon={<FiAlertTriangle />} color="#d86310" />
```

### Pattern 6: Recharts with Custom Tooltip

**Purpose:** Data visualization with brand styling

```jsx
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(216,99,16,0.2)',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(26,18,8,0.12)',
      fontSize: 12, fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontWeight: 700, color: '#1a1208', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// Usage in component
<ResponsiveContainer width="100%" height={200}>
  <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,18,8,0.05)" />
    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a7060' }} />
    <Tooltip content={<ChartTooltip />} />
    <Bar dataKey="value" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Pattern 7: Hover Action Menu

**Purpose:** Micro-interactions on row/item hover

```jsx
const [hovered, setHovered] = useState(false);

<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderRadius: 12,
    background: hovered ? 'rgba(216,99,16,0.05)' : '#faf9f7',
    transition: 'background 0.2s, transform 0.2s',
    transform: hovered ? 'translateX(4px)' : 'translateX(0)',
  }}
>
  <span>{itemName}</span>
  {hovered && (
    <div style={{ display: 'flex', gap: 4 }}>
      <button style={{ ...micro_button_style }}>
        <FiEdit2 />
      </button>
      <button style={{ ...micro_button_style }}>
        <FiTrash2 />
      </button>
    </div>
  )}
</div>
```

---

## 6. STYLING METHODOLOGY

### Approach: Inline CSS-in-JS + Tailwind (Optional)

**Primary Method:** Inline `style` objects in JSX (keeps styles co-located with components)

```jsx
// ✓ PREFERRED
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 16,
  padding: '20px 24px',
  background: '#fff',
  borderRadius: 20,
}}>
```

**Secondary Method:** Tailwind utility classes (for rapid iteration)

```jsx
// ✓ ACCEPTABLE (if Tailwind utility exists)
<div className="grid grid-cols-3 gap-4 p-6 bg-white rounded-3xl">
```

**Not Used:** CSS Modules, styled-components, or global CSS classes (except utilities)

### Global CSS Usage

Location: `src/styles/global.css`

**ONLY for:**
- CSS variables (color palette, spacing tokens)
- Responsive breakpoint utilities
- Utility classes (if needed)
- Font imports

```css
/* ✓ DO use global CSS for */
:root {
  --orange: #d86310;
  --cream: #f5f0ea;
}

/* ✓ For shared animation keyframes */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ✗ DON'T use for component styles */
.my-card { /* NO — inline styles instead */ }
```

### Responsive Design Pattern

**Without CSS Media Queries in JSX** (inline styles don't support @media):

```jsx
// Option 1: React state + window listener
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
useEffect(() => {
  const h = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', h);
  return () => window.removeEventListener('resize', h);
}, []);

return (
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
  }}>
```

**Option 2: CSS Grid auto-fit (responsive by default)**

```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
}}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

**Option 3: Tailwind responsive classes**

```jsx
// In className (if using Tailwind)
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

---

## 7. ICON LIBRARY SELECTION GUIDE

### React Icons (PREFERRED for dashboard)

**Best for:** Consistent icon sizing, many variants, fine control

```jsx
import { FiXXX, FiYYY }     from 'react-icons/fi';    // Feather (clean, 24×24)
import { MdXXX, MdYYY }     from 'react-icons/md';    // Material Design
import { BsXXX, BsYYY }     from 'react-icons/bs';    // Bootstrap
import { SiXXX, SiYYY }     from 'react-icons/si';    // Simple Icons
```

**Common dashboard icons:**

```jsx
// Navigation & structure
<FiHome />          // Dashboard
<FiCalendar />      // Schedule / Events
<FiBook />          // Courses / Learning
<FiUsers />         // Staff / Team
<FiBarChart2 />     // Analytics / Performance
<FiBell />          // Notifications
<FiMessageSquare /> // Messages / Announcements

// Actions
<FiPlus />          // Add / Create
<FiEdit2 />         // Edit / Modify
<FiTrash2 />        // Delete
<FiDownload />      // Export / Download
<FiPrinter />       // Print
<FiSearch />        // Search

// Status & Indicators
<FiCheck />         // Success / Complete
<FiX />             // Cancel / Error
<FiAlertTriangle /> // Warning / Conflict
<FiClock />         // Time / Duration
<FiMapPin />        // Location / Room

// Hierarchy & Navigation
<FiChevronUp />     // Collapse
<FiChevronDown />   // Expand
<FiChevronLeft />   // Previous
<FiChevronRight />  // Next
<FiMoreHorizontal />// Menu / Actions
<FiMenu />          // Hamburger

// Material Design (for specific use cases)
<MdOutlineClass />  // Class label
<MdOutlineMeetingRoom />  // Room label
```

### Lucide React (SECONDARY)

Use when React Icons don't have the icon you need:

```jsx
import { Clock, AlertTriangle, Users, BookOpen } from 'lucide-react';
```

**Rule:** Don't mix icon libraries excessively. Stick to React Icons for 90% of cases.

### Icon Sizing Convention

```jsx
// Tiny (11–13px): Labels, badges, inline indicators
<FiAlertTriangle size={12} />

// Small (14–17px): Buttons, inline actions
<FiEdit2 size={16} />

// Medium (18–22px): Main action buttons, KPI badges
<FiPlus size={20} />

// Large (24–32px): Header icons, page-level icons
<FiCalendar size={28} />
```

**Never use arbitrary sizes like 15, 19, 23** — stick to the scale.

---

## 8. COMMON COMPONENTS CHECKLIST

When building a dashboard page, use these pre-built components (already completed):

```
✓ DashboardSidebar.jsx    — Collapsible sidebar, gradient, hover expand
✓ Navbar.jsx              — Top bar (public pages)
✓ Footer.jsx              — Footer (public pages)
✓ Card wrapper            — Consistent containers
✓ Section (fade-in)       — Scroll animations
✓ AnimatedNumber          — Counters
✓ SegmentedFilter         — Tab-like controls
✓ Badge/Pill              — Status indicators
✓ ChartTooltip (Recharts) — Custom tooltips
✓ useLanguage() hook      — Bilingual text
```

**When you need a new component:**

1. Check if existing pattern fits (Card, Section, Badge, etc.)
2. If creating a new one, document it here + add to reusable patterns
3. Export from appropriate file (components/, data/, context/)
4. Avoid duplicating patterns

---

## 9. VALIDATION & TESTING CHECKLIST

Before shipping a page component, verify:

### Code Quality
```
□ No hardcoded text (all using t[key] from dashboardLanguage)
□ No duplicate imports
□ No unused variables/functions
□ Balanced braces, parentheses, brackets
□ 'use client' at top (if interactive)
□ default export present
□ No console.log() or debugging code left
□ Inline styles use exact hex colors from palette
```

### Responsiveness
```
□ Tested on 375px (mobile), 768px (tablet), 1440px (desktop)
□ Grid/flex layouts adapt gracefully
□ Text doesn't overflow
□ Touch targets ≥ 44px × 44px
□ No horizontal scroll on mobile (unless intentional, e.g., schedule grid)
```

### Styling & Design
```
□ All colors match brand palette (exact hex)
□ Spacing follows 4px scale (4, 8, 12, 16, 20, 24, 28, 32)
□ Border radius 8–20px (typically 20px for cards)
□ Shadows match hierarchy (subtle → medium → strong)
□ Hover states present on interactive elements
□ Icons properly sized (12, 16, 20, 28, etc.)
□ Typography: correct fontFamily, fontSize, fontWeight
```

### Internationalization
```
□ All user-visible text in dashboardLanguage.js
□ Both EN and FR keys present
□ Naming convention followed (feature_element_descriptor)
□ No mixed languages in a single key
□ RTL-safe (if needed in future)
```

### Data & Mocking
```
□ Mock data exported from [feature]MockData.js
□ All fields match SQL schema
□ Realistic test data (French names, valid dates, emails)
□ Edge cases covered (empty states, conflicts, errors)
□ Data imports at top of component file
□ No inline test objects
```

### Accessibility
```
□ All images have alt text
□ Buttons keyboard-accessible (Tab + Enter)
□ Color not sole differentiator (use icons + text)
□ Contrast ratio ≥ 4.5:1
□ Form labels connected to inputs
□ Heading hierarchy correct (no skipped levels)
□ ARIA labels on icon-only buttons
```

### Performance
```
□ No unnecessary re-renders (useState used sparingly)
□ Heavy components memoized (if > 500 lines)
□ No state updates in loops
□ IntersectionObserver for scroll animations (no scroll listeners)
□ Images optimized (next/image for Next.js)
□ Recharts wrapped in ResponsiveContainer
```

---

## 10. WORKFLOW & INTEGRATION

### Per-Page Development Sequence

For each new dashboard page (Courses, Bulletins, Staff, Performance, Announcements):

#### Step 1: i18n Keys
Create file: `[feature]_i18n_keys.js` or add to `dashboardLanguage.js`
```javascript
const [feature]_en = {
  feature_title: 'English title',
  feature_btn_action: 'English button',
  // ... all text strings
};

const [feature]_fr = {
  feature_title: 'Titre français',
  feature_btn_action: 'Bouton français',
  // ...
};
```

#### Step 2: Mock Data
Create file: `src/data/[feature]MockData.js`
```javascript
export const mock[Feature]Items = [ /* ... */ ];
export const mock[Feature]Stats = { /* ... */ };
// ... all mock objects
```

Verify: Schema alignment, realistic data, edge cases.

#### Step 3: Component File
Create: `src/app/(dashboard)/director/[feature]/page.jsx`
```jsx
'use client';

import { useState } from 'react';
import { [ReactIcons] } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import dashboardLanguage from '@/dashboard/dashboardLanguage';
import { mock[Feature]Items } from '@/data/[feature]MockData';

export default function [Feature]Page() {
  const { lang } = useLanguage();
  const t = dashboardLanguage[lang] ?? dashboardLanguage.fr;

  // Component logic...

  return (
    <div style={{ /* page styles */ }}>
      {/* JSX using t[keys], mock data, reusable patterns */}
    </div>
  );
}
```

#### Step 4: Validation
Run syntax check:
```bash
node --input-type=module << 'EOF'
import { readFileSync } from 'fs';
const code = readFileSync('src/app/(dashboard)/director/[feature]/page.jsx', 'utf8');
const ob = (code.match(/\{/g)||[]).length;
const cb = (code.match(/\}/g)||[]).length;
const op = (code.match(/\(/g)||[]).length;
const cp = (code.match(/\)/g)||[]).length;
console.log('Braces:', ob, '/', cb, ob===cb ? '✓' : '✗');
console.log('Parens:', op, '/', cp, op===cp ? '✓' : '✗');
console.log('Lines:', code.split('\n').length);
console.log("'use client':", code.startsWith("'use client'") ? '✓' : '✗');
console.log('default export:', code.includes('export default function') ? '✓' : '✗');
EOF
```

#### Step 5: Local Testing
```bash
npm run dev
# Navigate to /dashboard/director/[feature]
# Test: Language toggle (FR ↔ EN), responsive (375px/768px/1440px), interactions
```

#### Step 6: Delivery
- Provide 3 files: `[feature]-page.jsx`, `[feature]MockData.js`, `[feature]_i18n_keys.js` (or merged into dashboardLanguage.js)
- Syntax validated
- Integration instructions clear

### Sidebar Integration

When adding a new page, update `DashboardSidebar.jsx`:

```javascript
const NAV_ITEMS = [
  { key: 'nav_dashboard',    icon: LayoutDashboard, href: '/dashboard/director' },
  { key: 'nav_schedule',     icon: CalendarDays,    href: '/dashboard/director/schedule' },
  { key: 'nav_courses',      icon: BookOpen,        href: '/dashboard/director/courses' },      // ADD
  // ... more
];
```

Add language keys to `dashboardLanguage.js`:
```javascript
const en_additions = {
  nav_courses: 'Courses',
  // ...
};

const fr_additions = {
  nav_courses: 'Cours',
  // ...
};
```

---

## 11. PERFORMANCE & BEST PRACTICES

### React Optimization

```jsx
// ✓ Good: Extract to separate component to limit re-renders
function HeavyChart({ data }) {
  return <BarChart data={data} />;
}

// ✗ Bad: Defined inline, re-created every render
const chart = <BarChart data={data} />;

// ✓ Good: useCallback for event handlers in loops
const handleDelete = useCallback((id) => {
  // ...
}, []);

// ✓ Good: useMemo for expensive calculations
const filtered = useMemo(() => {
  return items.filter(i => i.type === selectedType);
}, [items, selectedType]);
```

### Bundle Size

- **Recharts:** ~100kb (acceptable for analytics pages)
- **React Icons:** ~1kb per icon imported (import only what you use)
- **Lucide:** ~5kb per icon (use sparingly)
- **Next.js 14:** ~50kb gzipped (framework baseline)

**Total acceptable:** ~400kb gzipped for dashboard

### Lazy Loading (if needed)

```jsx
import dynamic from 'next/dynamic';

const HeavyAnalyticsSection = dynamic(
  () => import('@/components/AnalyticsSection'),
  { loading: () => <div>Loading...</div> }
);
```

---

## 12. DEPLOYMENT & PRODUCTION READINESS

### Before Production Build

```bash
# 1. Run linter / formatter (add to package.json scripts)
npm run lint

# 2. Build and check for errors
npm run build

# 3. Check bundle size
npm run analyze-bundle  # (if configured)

# 4. Manual QA
npm run dev
# Test all pages, language toggle, mobile/desktop, mock data flows
```

### Production Checklist

```
□ All images optimized (use next/image)
□ No API keys/secrets in code
□ Error boundaries in place (Suspense for dynamic imports)
□ Loading states for async data
□ Fallback UI for image failures
□ Analytics/monitoring configured
□ Security headers in next.config.js
□ Environment variables documented (.env.example)
```

---

## 13. QUICK REFERENCE SNIPPETS

### Page Template (Minimal)

```jsx
'use client';

import { useState } from 'react';
import { FiIcon } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import dashboardLanguage from '@/dashboard/dashboardLanguage';
import { mockData } from '@/data/[feature]MockData';

export default function [Feature]Page() {
  const { lang } = useLanguage();
  const t = dashboardLanguage[lang] ?? dashboardLanguage.fr;
  const [state, setState] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f0ea,#ede8e0)', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{
        background: 'rgba(245,240,234,0.9)', backdropFilter: 'blur(16px)',
        padding: '18px 28px', borderBottom: '1px solid rgba(216,99,16,0.1)',
      }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 700, color: '#1a1208' }}>
          {t.feature_title}
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px' }}>
        {/* Use Card, Section, and reusable patterns here */}
      </div>
    </div>
  );
}
```

### Color Palette Quick Apply

```jsx
// Create a small helper in your component
const COLORS = {
  orange:     '#d86310',
  brown:      '#7a3b1e',
  cream:      '#f5f0ea',
  white:      '#ffffff',
  textDark:   '#1a1208',
  textMid:    '#4a3728',
  textLight:  '#8a7060',
};

// Use like: background: COLORS.orange
```

---

## 14. TROUBLESHOOTING

### "Styling not applying"
→ Check hex colors (MUST be exact), verify specificity, check z-index, ensure position property set

### "Text appears cut off on mobile"
→ Check padding/margins, use `whiteSpace: 'nowrap'` only when necessary, test at actual viewport sizes

### "useLanguage() returns undefined"
→ Verify LanguageContext.jsx exists at `src/context/`, check import path, ensure component wrapped by provider in layout

### "Mock data not rendering"
→ Check import path, verify data is exported, console.log to inspect shape, ensure field names match schema

### "Hover animations janky"
→ Avoid `box-shadow` + `transform` simultaneously (use separate transitions), use `will-change` sparingly, check DevTools Performance tab

### "Chart not rendering"
→ Wrap in ResponsiveContainer, check data shape vs dataKey, verify fills/colors are valid hex, inspect browser console

---

## 15. REFERENCES & RESOURCES

```
Project Context:    /mnt/user-data/outputs/BRIGHTSCHOOL_FULL_CONTEXT.js
Token Optimization: /mnt/user-data/outputs/TOKEN_OPTIMIZATION_SKILLS.js
Cheat Sheet:        /mnt/user-data/outputs/QUICK_REFERENCE_CHEATSHEET.js
SQL Schema:         /mnt/user-data/uploads/Ecole-primaire.sql
Design Colors:      See section 2 of this file
Component Patterns: See section 5 of this file
```

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-30 | Initial SKILL.md — covers architecture, design, i18n, mock data, patterns, styling |

---

**Last Updated:** 2026-05-30  
**Maintained By:** Jorel (BrightSchool Project Lead)  

