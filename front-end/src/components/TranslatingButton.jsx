"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export function TranslatingButton() {
  const { lang, toggleLanguage } = useLanguage();
  return (
    <button
      onClick={() => toggleLanguage(lang === "en" ? "fr" : "en")}
      style={{
        border: "1.5px solid rgba(196,96,26,0.25)",
        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--orange)",
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.05em",
      }}
    >
      {lang === "en" ? "FR" : "EN"}
    </button>
  );
}
