"use client";
import React, { createContext, useContext, useState } from "react";
import {
  Presentation,
  Lightbulb,
  BookOpen,
  Activity,
  BookType,
  Leaf,
  ShieldCheck,
  Award,
} from "lucide-react";
import { en } from "../messages/en";
import { fr } from "../messages/fr";

// Dictionnaire de mapping pour résoudre dynamiquement les icônes sans saturer la mémoire du Contexte
const iconMap = {
  BookType,
  ShieldCheck,
  Leaf,
  Award,
  Presentation,
  Lightbulb,
  BookOpen,
  Activity,
};

export const getIconComponent = (iconName) => {
  return iconMap[iconName] || null;
};

const translations = {
  fr,
  en
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("fr");

  const toggleLanguage = (chosenLang) => {
    if (translations[chosenLang]) setLang(chosenLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// L'exportation de la fonction nommée (Custom Hook obligatoire pour régler votre erreur Webpack)
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}