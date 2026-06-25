"use client";

import React, { useState, useEffect } from "react";
import { 
  FiChevronLeft, FiChevronRight, 
  FiBookOpen, FiCpu, FiMic, FiHeart, 
  FiClock, FiDownload, FiMail 
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { homeLanguage } from "@/context/Homelanguage"; 

export default function SchoolPrograms() {
  // const { language } = useLanguage();
  const {lang} = useLanguage(); // À remplacer par votre hook
  
  const activeLang = lang?.toLowerCase();
  const currentDictionary = homeLanguage[activeLang] || homeLanguage["fr"];
  const t = currentDictionary?.schoolPrograms;

  // 2. États pour le Carrousel et les Onglets
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("primary"); // "early" ou "primary"

  // Images du carrousel avec Unsplash pour le test
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop",
      alt: t?.slide1Alt
    },
    {
      id: 2,
      image: "https://media.istockphoto.com/id/2244907242/photo/close-up-african-boy-and-multicultural-elementary-students-girl-kids-wearing-lab-coat.jpg?s=612x612&w=0&k=20&c=yR7JMJuiFuSLxsNW6sMQhz6viECMSbwHqoI4plV8u0M=",
      alt: t?.slide2Alt
    },
    {
      id: 3,
      image: "https://media.istockphoto.com/id/155344110/photo/happy-young-south-african-girl-with-a-big-smile.jpg?s=612x612&w=0&k=20&c=871bYYuj5nofwYRdTgf6Xs5927KWPU6b6jp3ZVRP24A=",
      alt: t?.slide3Alt
    }
  ];

  // 3. Logique du Carrousel (Auto-play)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Change toutes les 5 secondes
    return () => clearInterval(timer); // Nettoyage au démontage
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  if (!t) return <div className="min-h-screen bg-[#f5f0ea] flex items-center justify-center text-[#7a3b1e]"><p className="animate-pulse">Chargement...</p></div>;

  // 4. Données des programmes
  const programs = [
    { title: t.prog1Title, desc: t.prog1Desc, icon: <FiBookOpen className="w-8 h-8 text-[#d86310]" /> },
    { title: t.prog2Title, desc: t.prog2Desc, icon: <FiCpu className="w-8 h-8 text-[#d86310]" /> },
    { title: t.prog3Title, desc: t.prog3Desc, icon: <FiMic className="w-8 h-8 text-[#d86310]" /> },
    { title: t.prog4Title, desc: t.prog4Desc, icon: <FiHeart className="w-8 h-8 text-[#d86310]" /> }
  ];

  // 5. Données de la Timeline
  const timeline = [
    { time: t.time1, title: t.time1Title, desc: t.time1Desc },
    { time: t.time2, title: t.time2Title, desc: t.time2Desc },
    { time: t.time3, title: t.time3Title, desc: t.time3Desc },
    { time: t.time4, title: t.time4Title, desc: t.time4Desc }
  ];

  return (
    <div className="min-h-screen bg-[#f5f0ea] text-[#1a1208] font-['DM_Sans',sans-serif] pb-20">
      
      {/* =========================================
          SECTION 1 : HERO CAROUSEL
      ========================================= */}
      <section className="relative w-full h-[60vh] min-h-[500px] overflow-hidden bg-[#1a1208]">
        {/* Images en background avec effet de fondu */}
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-40" : "opacity-0"
            }`}
          >
            <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Overlay texte central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Playfair_Display',serif] leading-tight drop-shadow-lg">
              {t.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-[#FDFBF7] max-w-2xl mx-auto drop-shadow-md">
              {t.heroSubtitle}
            </p>
          </div>
        </div>

        {/* Contrôles du carrousel */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-[#d86310] hover:text-white text-white backdrop-blur-md transition-all border border-white/30"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-[#d86310] hover:text-white text-white backdrop-blur-md transition-all border border-white/30"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* =========================================
          SECTION 2 : SÉLECTEUR DE CYCLE & PROGRAMMES
      ========================================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Onglets */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <button 
            onClick={() => setActiveTab("early")}
            className={`px-8 py-4 rounded-full font-bold transition-all duration-300 ${
              activeTab === "early" 
                ? "bg-[#d86310] text-white shadow-lg shadow-[#d86310]/30" 
                : "bg-white text-[#7a3b1e] border border-[#E5E4E2] hover:border-[#d86310]"
            }`}
          >
            {t.tabEarlyYears}
          </button>
          <button 
            onClick={() => setActiveTab("primary")}
            className={`px-8 py-4 rounded-full font-bold transition-all duration-300 ${
              activeTab === "primary" 
                ? "bg-[#d86310] text-white shadow-lg shadow-[#d86310]/30" 
                : "bg-white text-[#7a3b1e] border border-[#E5E4E2] hover:border-[#d86310]"
            }`}
          >
            {t.tabPrimary}
          </button>
        </div>

        {/* Grille des Programmes utilisant votre classe globale .card-feature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700" key={activeTab}>
          {programs.map((prog, index) => (
            <div key={index} className="card-feature group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-[#f5f0ea] flex items-center justify-center mb-6 border border-[#E5E4E2] group-hover:border-[#d86310] transition-colors">
                {prog.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#1a1208] font-['Playfair_Display',serif] mb-4">
                {prog.title}
              </h3>
              <p className="text-[#7a3b1e] leading-relaxed">
                {prog.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          SECTION 3 : LA TIMELINE "UN JOUR À BRIGHTSCHOOL"
      ========================================= */}
      <section className="bg-white py-24 border-y border-[#E5E4E2]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1208] font-['Playfair_Display',serif]">
              {t.timelineTitle}
            </h2>
            <p className="text-[#7a3b1e] text-lg">
              {t.timelineSubtitle}
            </p>
          </div>

          {/* Timeline Verticale */}
          <div className="relative border-l-2 border-[#d86310]/20 ml-4 md:ml-8 space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className="relative pl-10 md:pl-16 group">
                {/* Point de repère */}
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-[#f5f0ea] border-4 border-[#d86310] group-hover:scale-125 transition-transform duration-300"></div>
                
                {/* Contenu */}
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-2">
                  <span className="text-[#d86310] font-bold flex items-center gap-2 text-lg">
                    <FiClock /> {item.time}
                  </span>
                  <h3 className="text-xl font-bold text-[#1a1208] font-['Playfair_Display',serif]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[#7a3b1e] leading-relaxed max-w-2xl">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 4 : CTA (APPEL À L'ACTION)
      ========================================= */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-[#7a3b1e] rounded-3xl p-10 md:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
          {/* Cercle décoratif */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-[#f5f0ea] font-['Playfair_Display',serif] relative z-10">
            {t.ctaTitle}
          </h2>
          <p className="text-[#f5f0ea]/80 max-w-2xl mx-auto text-lg relative z-10">
            {t.ctaSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10 pt-4">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#d86310] hover:bg-[#c4560d] text-white px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-lg">
              <FiDownload className="w-5 h-5" />
              {t.ctaBtnDownload}
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border-2 border-white px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1">
              <FiMail className="w-5 h-5" />
              {t.ctaBtnContact}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}