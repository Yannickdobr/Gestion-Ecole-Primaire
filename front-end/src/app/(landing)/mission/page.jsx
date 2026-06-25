"use client";

import React from "react";
import { FiCheckCircle } from "react-icons/fi";
// Remplacez par le chemin exact de votre contexte de langue et fichier dictionnaire
// import { useLanguage } from "@/context/LanguageContext";
import { homeLanguage } from "@/context/Homelanguage";
import { useLanguage } from "@/context/LanguageContext";

export default function MissionsPage() {
  const { lang } = useLanguage();
  
  const activeLang = lang?.toLowerCase();

  // 2. Safely look up the translations, fallback to "fr" (or "en") if undefined
  const currentDictionary = homeLanguage[activeLang] || homeLanguage["fr"];

  // 3. Extract the missions sub-object safely
  const t = currentDictionary?.missions;

  // 4. Loading state protection: If dictionary keys aren't ready yet, show a clean loader
  if (!t) {
    return (
      <div className="min-h-screen bg-[#f5f0ea] flex items-center justify-center text-[#7a3b1e]">
        <p className="animate-pulse font-medium">
          Chargement des traductions...
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f5f0ea] text-[#1a1208] font-['DM_Sans',sans-serif] pb-24">
      {/* =========================================
          SECTION 1 : HERO / ABOUT US
      ========================================= */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Colonne Gauche : Texte & Logo */}
          <div className="space-y-8 relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-white/40 p-2 rounded-full border border-[#7a3b1e]/10">
                <img
                  src="/star.png"
                  alt="BrightSchool Logo"
                  className="w-10 h-10 object-contain"
                />
              </span>
              <span className="text-[#d86310] font-semibold tracking-wider text-sm uppercase">
                {t.aboutSubtitle}
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-[#1a1208] font-['Playfair_Display',serif] leading-tight">
              {t.aboutTitle}
            </h1>

            <p className="text-lg text-[#7a3b1e] leading-relaxed max-w-lg">
              {t.aboutDescription}
            </p>
          </div>

          {/* Colonne Droite : Image Hero */}
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://media.istockphoto.com/id/1470160017/photo/portrait-of-multi-cultural-elementary-school-pupils-with-female-teacher-outdoors-at-school.webp?a=1&b=1&s=612x612&w=0&k=20&c=HqKlZc52DD3SaVKtgZWf5NC3WsRg7TVl1g7To_JAEG0="
              alt="Students learning"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay subtil pour adoucir l'image */}
            <div className="absolute inset-0 bg-[#7a3b1e]/10"></div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 2 : MISSION & VISION (ASYMÉTRIQUE)
      ========================================= */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Colonne Gauche : Textes */}
          <div className="space-y-16 flex flex-col justify-center">
            {/* Bloc Mission */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#d86310] font-['Playfair_Display',serif]">
                {t.missionTitle}
              </h2>
              {/* Le slogan reste strictement en anglais comme demandé */}
              <blockquote className="text-xl font-medium text-[#7a3b1e] italic border-l-4 border-[#d86310] pl-4">
                "{t.missionSlogan}"
              </blockquote>
              <p className="text-[#4a3728] leading-relaxed text-lg">
                {t.missionDescription}
              </p>
            </div>

            {/* Bloc Vision */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#d86310] font-['Playfair_Display',serif]">
                {t.visionTitle}
              </h2>
              <p className="text-[#4a3728] leading-relaxed text-lg mb-6">
                {t.visionDescription}
              </p>

              {/* Objectifs Concrets */}
              <ul className="space-y-4">
                {[t.objective1, t.objective2, t.objective3, t.objective4].map(
                  (objective, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <FiCheckCircle className="w-6 h-6 text-[#d86310] flex-shrink-0 mt-0.5" />
                      <span className="text-[#4a3728] font-medium leading-relaxed">
                        {objective}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          {/* Colonne Droite : Images Superposées (Inspiré du layout image_b35a88) */}
          <div className="relative h-[600px] hidden lg:block">
            {/* Image principale (en haut à droite) */}
            <div className="absolute top-0 right-0 w-4/5 h-[450px] rounded-2xl overflow-hidden shadow-xl z-10">
              <img
                src="https://media.istockphoto.com/id/950614324/photo/school-girl-writing-in-class.webp?a=1&b=1&s=612x612&w=0&k=20&c=9oyBRAcZj82djaBi6PfXczIpXneb5P3BDQAq0AzqnlE="
                alt="Our Mission"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image secondaire (en bas à gauche, superposée) */}
            <div className="absolute bottom-0 left-0 w-3/5 h-[350px] rounded-2xl overflow-hidden shadow-2xl z-20 border-8 border-[#f5f0ea]">
              <img
                src="https://media.istockphoto.com/id/2244907242/photo/close-up-african-boy-and-multicultural-elementary-students-girl-kids-wearing-lab-coat.jpg?s=612x612&w=0&k=20&c=yR7JMJuiFuSLxsNW6sMQhz6viECMSbwHqoI4plV8u0M="
                alt="Our Vision"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Élément décoratif optionnel (points ou accent) */}
            <div className="absolute top-1/2 -right-6 text-[#d86310] text-4xl opacity-50 font-serif">
              ↓
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3 : MEET THE TEAM
      ========================================= */}
      <section className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        {/* En-tête de l'équipe */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#d86310] font-['Playfair_Display',serif] uppercase tracking-widest">
            {t.teamTitle}
          </h2>
          <p className="text-[#7a3b1e] text-lg font-medium">{t.teamSubtitle}</p>
        </div>

        {/* Statistiques et labels */}
        <div className="flex items-center justify-between border-b-2 border-[#7a3b1e]/20 pb-4 mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#d86310]">
              {t.teamCount}
            </span>
            <span className="text-[#7a3b1e] font-semibold tracking-wider text-sm">
              {t.teamLabel}
            </span>
          </div>
          <span className="text-sm text-[#7a3b1e] uppercase tracking-widest">
            Administration
          </span>
        </div>

        {/* Liste minimaliste de l'équipe */}
        <div className="space-y-2">
          {[t.role1, t.role2, t.role3, t.role4].map((role, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-5 border-b border-[#7a3b1e]/10 hover:bg-white/30 transition-colors px-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d86310]"></div>
                <span className="text-[#4a3728] font-medium text-lg">
                  {role}
                </span>
              </div>
              <span className="text-sm text-[#8a7060] font-mono tracking-widest">
                [BRIGHT] . [EDU]
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
