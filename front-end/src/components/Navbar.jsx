"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  en: {
    mission: "Our Mission",
    why: "Why BrightSchool",
    programs: "Programs",
    portal: "Student Portal",
  },
  fr: {
    mission: "Notre Mission",
    why: "Pourquoi nous",
    programs: "Programmes",
    portal: "Portail Élève",
  },
};

export default function Navbar() {
  const { lang, toggleLanguage } = useLanguage();
  const t = translations[lang];
  const pathname = usePathname();

  const navLinks = [
    { label: t.mission, to: "/mission" },
    { label: t.why, to: "/features" },
    { label: t.programs, to: "/programs" },
    { label: t.howTo, to: "/contact" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(245,240,234,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(196,96,26,0.1)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <Image
            src="/star.png"
            alt="HotelHub Logo"
            width={100} // Largeur fixe en pixels (ex: 40px)
            height={100} // Hauteur fixe en pixels
            priority // Indique à Next.js de charger cette image en priorité (très important pour un logo)
            className="object-contain" // Assure que l'image ne soit pas déformée
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 18,
              color: "var(--text-dark)",
            }}
          >
            BrightSchool
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className="text-underline"
              style={{
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                color:
                  pathname === link.to ? "var(--orange)" : "var(--text-mid)",
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Lang + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
          <Link
            href="/login"
            className="btn-primary"
            style={{ fontSize: 13 }}
          >
            {t.portal}
          </Link>
        </div>
      </div>
    </nav>
  );
}
