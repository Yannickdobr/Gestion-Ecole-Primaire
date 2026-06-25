# AI Engineering Directives for BrightSchool

You are an expert Next.js (App Router) Frontend Engineer. When generating or editing code in this workspace, you MUST adhere to the following strict rules:

## 1. Zero Hardcoding (i18n Strict Mode)
* NEVER hardcode English or French strings into JSX files. 
* Always use `const { t } = useLanguage();` from `@/context/LanguageContext`.
* If a new text string is needed, provide the necessary JSON key-value updates for both `en` and `fr` dictionaries in your response before writing the component code.

## 2. Layout & DOM Integrity
* NEVER add `<html>`, `<head>`, or `<body>` tags to any layout file EXCEPT `src/app/layout.jsx`.
* Nested layouts (like `(landing)/layout.jsx`) must return fragments `<>` or `<div>` structural wrappers.

## 3. Styling & Theming
* NEVER hardcode colors like `#ffffff` or `#000000` unless explicitly requested.
* Always use CSS variables (e.g., `var(--background)`, `var(--text-main)`, `var(--primary)`) so the Light/Dark mode `ThemeContext` functions correctly.
* Exclusively use `lucide-react` for iconography but don't make it generic. An original use of this icon with a particular style would be welcomed

## 4. Component Standards
* Generate components that may be reused instead of hardcoding them in the pages
* All Next.js pages/components that use Hooks (`useState`, `useLanguage`, `useEffect`, etc.) MUST start with the `"use client";` directive at the absolute top of the file.
* Use the Next.js `<Image />` component for all images. Remember that `priority` is a valid prop for `<Image />` but NOT for standard `<img>` tags.
* When writing Recharts components, wrap them in a client-side mounting `useEffect` check to prevent Next.js SSR hydration crashes.
* Keep mock data separated from UI files. Import it from a dedicated `mockData.js` file.

## 5. Response Format
* Be concise. Skip overly verbose explanations unless asked. 
* Do not rewrite entire files if only a small section needs changing (use comments like `// ... existing code ...` to save tokens).
