"use client";

import { homeLanguage } from "@/context/Homelanguage";
import { useLanguage } from "@/context/LanguageContext";

import React from "react";
import { FiGlobe, FiStar, FiMic, FiHeart, FiArrowRight } from "react-icons/fi";

export default function FeaturesPage() {
  // 1. Connexion au hook de langue avec sécurité
  // const { language } = useLanguage();
  const {lang} = useLanguage(); 
  
  const activeLang = lang?.toLowerCase();
  const currentDictionary = homeLanguage[activeLang] || homeLanguage["fr"];
  const t = currentDictionary?.whyChooseUs;

  if (!t) {
    return (
      <div className="min-h-screen bg-[#f5f0ea] flex items-center justify-center text-[#7a3b1e]">
        <p className="animate-pulse font-medium">Chargement...</p>
      </div>
    );
  }

  // Tableau des piliers pour faciliter le mapping avec les icônes
  const pillars = [
    {
      title: t.pillar1Title,
      desc: t.pillar1Desc,
      icon: <FiGlobe className="w-8 h-8 text-[#d86310]" />
    },
    {
      title: t.pillar2Title,
      desc: t.pillar2Desc,
      icon: <FiStar className="w-8 h-8 text-[#d86310]" />
    },
    {
      title: t.pillar3Title,
      desc: t.pillar3Desc,
      icon: <FiMic className="w-8 h-8 text-[#d86310]" />
    },
    {
      title: t.pillar4Title,
      desc: t.pillar4Desc,
      icon: <FiHeart className="w-8 h-8 text-[#d86310]" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f0ea] text-[#1a1208] font-['DM_Sans',sans-serif] pb-16">
      
      {/* =========================================
          SECTION 1 : HERO & PILIERS (ASYMÉTRIQUE)
      ========================================= */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:py-28">
        
        {/* En-tête de page */}
        <div className="max-w-3xl mb-16 space-y-6">
          <div className="hero-line-wrapper">
            <span className="text-[#d86310] font-semibold tracking-wider text-sm uppercase">
              {t.whyTitle}
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-[#1a1208] font-['Playfair_Display',serif] leading-tight">
            {t.whySubtitle}
          </h1>
          <p className="text-lg text-[#7a3b1e] leading-relaxed max-w-2xl">
            {t.whyDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Colonne Gauche : Grille des cartes avec coins asymétriques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, index) => (
              <div 
                key={index} 
                className="card-feature"
              >
                <div className="w-14 h-14 rounded-full bg-[#f5f0ea] flex items-center justify-center mb-6">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1a1208] font-['Playfair_Display',serif] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-[#7a3b1e] text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Colonne Droite : Images Superposées (Style page Mission) */}
          <div className="relative h-[600px] hidden lg:block">
            {/* Image principale */}
            <div className="absolute top-0 right-0 w-4/5 h-[450px] rounded-tl-[3rem] rounded-br-[3rem] overflow-hidden shadow-xl z-10">
              <img
                src="https://media.istockphoto.com/id/2202092156/photo/elementary-school-teacher-at-front-of-class-talking-to-children-gesturing.jpg?s=612x612&w=0&k=20&c=WmhTcS4HnKG3h0xJn6u6arNBEELHZLYnOPfanFK98c0="
                alt="Students collaborating"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Image secondaire superposée */}
            <div className="absolute bottom-0 left-0 w-3/5 h-[350px] rounded-tr-[3rem] rounded-bl-[3rem] overflow-hidden shadow-2xl z-20 border-8 border-[#f5f0ea]">
              <img
                src="https://media.istockphoto.com/id/950609102/photo/girl-solving-mathematical-addition.jpg?s=612x612&w=0&k=20&c=hIOWKbDapOX0leF6wwRkSYeqJggAuEYTLdY-KHf1je4="
                alt="Student speaking"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          SECTION 2 : CHIFFRES CLÉS (METRICS)
      ========================================= */}
      <section className="bg-[#7a3b1e] py-16 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#f5f0ea] font-['Playfair_Display',serif]">
              {t.metricsTitle}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-[#d86310]/30 text-center">
            {/* Chiffre 1 */}
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <span className="text-6xl font-bold text-[#d86310] mb-4">{t.metric1Value}</span>
              <span className="text-[#f5f0ea] font-medium tracking-wide uppercase text-sm max-w-[200px]">
                {t.metric1Label}
              </span>
            </div>
            {/* Chiffre 2 */}
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <span className="text-6xl font-bold text-[#d86310] mb-4">{t.metric2Value}</span>
              <span className="text-[#f5f0ea] font-medium tracking-wide uppercase text-sm max-w-[200px]">
                {t.metric2Label}
              </span>
            </div>
            {/* Chiffre 3 */}
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <span className="text-6xl font-bold text-[#d86310] mb-4">{t.metric3Value}</span>
              <span className="text-[#f5f0ea] font-medium tracking-wide uppercase text-sm max-w-[200px]">
                {t.metric3Label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3 : TÉMOIGNAGE & CTA
      ========================================= */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-16">
        
        {/* Témoignage minimaliste */}
        <div className="space-y-8">
          <div className="text-[#d86310] text-7xl font-serif opacity-30 leading-none h-10">
            "
          </div>
          <p className="text-2xl md:text-3xl text-[#1a1208] font-['Playfair_Display',serif] italic leading-relaxed">
            {t.testimonialQuote}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-[1px] bg-[#d86310]"></div>
            <span className="text-[#7a3b1e] font-bold uppercase tracking-widest text-sm">
              {t.testimonialAuthor}
            </span>
            <div className="w-10 h-[1px] bg-[#d86310]"></div>
          </div>
        </div>

        {/* Bloc CTA (Appel à l'action) */}
        <div className="bg-[#1a1208] rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center space-y-8 shadow-2xl relative overflow-hidden">
          {/* Cercle décoratif de fond */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#7a3b1e] rounded-full opacity-20 blur-3xl"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white font-['Playfair_Display',serif] relative z-10 text-center">
            {t.ctaTitle}
          </h2>
          
          <button className="relative z-10 group flex items-center gap-3 bg-[#d86310] hover:bg-[#c4560d] text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(216,99,16,0.4)]">
            {t.ctaButton}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </section>

    </div>
  );
}