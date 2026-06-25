"use client";

import React from "react";
import { FiMenu, FiBell, FiSearch, FiGlobe, FiChevronDown } from "react-icons/fi";

// Simulation de l'import de votre session active (basée sur mockData.json)
// import { currentStudentSession } from "@/data/resolvedStudentSession";

export default function StudentNavbar({ onToggleSidebar, pageTitle = "Mon Tableau de Bord" }) {
  // Mock local pour la démonstration (à remplacer par votre vrai Context/Import)
  const currentStudentSession = {
    studentProfile: {
      nom: "EBOUTOU",
      prenom: "Marc",
      matricule: 20260001,
      photoURL: "https://media.istockphoto.com/id/2205194190/photo/smiling-businesswoman-using-smartphone-in-hotel-room.webp?a=1&b=1&s=612x612&w=0&k=20&c=6zBtOdAWk_DGmIl7VFJMLRVTBRndnzXj2Pclq4CgvqY=", 
    },
    academicContext: {
      salleLibelle: "Salle CM2 Élite",
    },
    uiCounters: {
      unreadCount: 1,
    }
  };

  const { studentProfile, academicContext, uiCounters } = currentStudentSession;

  return (
    <nav 
      className="w-full h-24 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300"
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--silver)"
      }}
    >
      {/* =========================================
          PARTIE GAUCHE : Toggle & Titre
      ========================================= */}
      <div className="flex items-center gap-6">
        {/* Bouton pour réduire/ouvrir la sidebar (Inspiré de l'icône de la maquette) */}
        <button 
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105"
          style={{ 
            backgroundColor: "var(--surface-soft)", 
            color: "var(--orange)" 
          }}
          aria-label="Basculer le menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Titre dynamique de la page courante */}
        <h1 
          className="text-2xl font-bold hidden sm:block"
          style={{ 
            fontFamily: "var(--font-display)", 
            color: "var(--text-dark)" 
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* =========================================
          PARTIE CENTRALE : Barre de recherche
      ========================================= */}
      <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <FiSearch style={{ color: "var(--text-light)" }} />
        </div>
        <input 
          type="text" 
          placeholder="Rechercher un cours, un devoir..." 
          className="w-full py-3 pl-12 pr-4 rounded-full outline-none transition-all"
          style={{ 
            backgroundColor: "var(--cream)", 
            color: "var(--text-mid)",
            fontFamily: "var(--font-body)",
            border: "1px solid transparent"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--orange)"}
          onBlur={(e) => e.target.style.borderColor = "transparent"}
        />
      </div>

      {/* =========================================
          PARTIE DROITE : Outils & Profil
      ========================================= */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Sélecteur de langue */}
        <button 
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full font-bold text-sm transition-colors"
          style={{ 
            color: "var(--brown)", 
            backgroundColor: "transparent",
            border: "1px solid var(--silver)" 
          }}
        >
          <FiGlobe className="w-4 h-4" />
          EN
        </button>

        {/* Cloche de notifications (Style inspiré de l'image rose) */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:-translate-y-1"
          style={{ backgroundColor: "var(--surface-soft)" }}
        >
          <FiBell className="w-5 h-5" style={{ color: "var(--brown)" }} />
          
          {/* Pastille de notification (Affiche dynamiquement le count) */}
          {uiCounters.unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold border-2"
              style={{ 
                backgroundColor: "var(--orange)", 
                color: "var(--surface)",
                borderColor: "var(--surface)"
              }}
            >
              {uiCounters.unreadCount}
            </span>
          )}
        </button>

        {/* Ligne séparatrice verticale */}
        <div className="w-[1px] h-8 hidden sm:block" style={{ backgroundColor: "var(--silver)" }}></div>

        {/* Profil de l'élève (Avatar + Infos extraites du JSON) */}
        <div className="flex items-center gap-3 cursor-pointer group">
          {/* Avatar de l'élève */}
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-colors"
            style={{ borderColor: "var(--cream-dark)" }}
          >
            <img 
              src={studentProfile.photoURL} 
              alt={`Avatar de ${studentProfile.prenom}`} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Informations textuelles (Masquées sur très petits écrans) */}
          <div className="hidden sm:flex flex-col">
            <span 
              className="text-sm font-bold leading-tight"
              style={{ fontFamily: "var(--font-body)", color: "var(--text-dark)" }}
            >
              {studentProfile.prenom} {studentProfile.nom}
            </span>
            <span 
              className="text-xs leading-tight mt-0.5"
              style={{ color: "var(--text-light)" }}
            >
              {academicContext.salleLibelle} • ID: {studentProfile.matricule}
            </span>
          </div>

          <FiChevronDown 
            className="w-4 h-4 hidden sm:block transition-transform group-hover:translate-y-0.5" 
            style={{ color: "var(--text-light)" }}
          />
        </div>

      </div>
    </nav>
  );
}