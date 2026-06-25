# Project Context: BrightSchool 

## Overview
BrightSchool is a modern web application for a progressive primary school. It features a public-facing landing site and a secure internal dashboard for managing school operations. 

## Tech Stack
* **Framework:** Next.js (App Router, v15+)
* **UI Library:** React
* **Styling:** Global CSS Variables (for theming) + Inline/Modular CSS for structural layouts.
* **Icons:** `lucide-react`
* **Charts:** `recharts`

## Architecture & Routing (Strict App Router Pattern)
We use Next.js Route Groups to manage layouts without injecting URL paths.
* `src/app/layout.jsx`: The ABSOLUTE ROOT. Contains `<html>`, `<body>`, and global context providers (`ThemeProvider`, `LanguageProvider`).
* `src/app/(landing)/layout.jsx`: Fragment wrapper (`<>`) containing the `<Navbar>` and `<Footer>` for public pages. NO html/body tags.
* `src/app/dashboard/layout.jsx` (or similar): Wraps the internal app with a Sidebar. No global Navbar/Footer. NO html/body tags.

## Global Contexts & State
1. **LanguageContext (i18n):** Handles EN/FR switching. 
   * Hook: `const { t, lang, toggleLanguage } = useLanguage();`
   * **Rule:** ZERO hardcoded strings in UI components. Everything must come from the dictionary (`t.key`).
2. **ThemeContext (Dark/Light Mode):** * Hook: `const { theme, toggleTheme } = useTheme();`
   * **Rule:** Relies on CSS variables (e.g., `var(--orange)`) injected via the `data-theme` attribute on the HTML tag. Never hardcode hex colors in UI files unless strictly necessary for a unique element.

## Design System & UI Constraints
* **Brand Palette:** Warm cream backgrounds (`#f5f0ea`), crisp white/cream cards, deep terracotta text (`#7a3b1e`), and BrightSchool Orange (`#d86310`).
* **Components:** Card-based UI, clean rectangles with slightly rounded corners  subtle drop shadows, and smooth transitions every where necessary.
* **Data Presentation:** All mock data must be abstracted into a `mockData.js` file adapted to its use. UI components must map over this data. No inline mock objects inside the JSX files.


