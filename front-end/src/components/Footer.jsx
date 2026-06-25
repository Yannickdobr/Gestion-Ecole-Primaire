"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const content = {
  en: {
    tagline:
      "Nurturing young minds through innovative education and creating lifelong learners for tomorrow's world.",
    cols: [
      {
        title: "Navigation",
        links: [
          { label: "Our Mission", to: "/mission" },
          { label: "BrightSchool", to: "/" },
          { label: "Academic Programs", to: "/#programs" },
        ],
      },
      {
        title: "Programs",
        links: [
          { label: "Early Years", to: "/#programs" },
          { label: "Middle Elementary", to: "/#programs" },
          { label: "Upper Elementary", to: "/#programs" },
          { label: "Extracurricular", to: "/#programs" },
        ],
      },
      {
        title: "About",
        links: [
          { label: "Contact", to: "/contact" },
          { label: "About Us", to: "/mission" },
          { label: "Our Teachers", to: "/mission" },
          { label: "Careers", to: "/contact" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Student Portal", to: "/contact" },
          { label: "News & Insights", to: "/news" },
          { label: "School Calendar", to: "/contact" },
        ],
      },
    ],
    copy: "Copyright 2025, BrightSchool. All Rights Reserved.",
    privacy: "Privacy Policy",
    terms: "Terms and Conditions",
  },
  fr: {
    tagline:
      "Former les jeunes esprits grâce à une éducation innovante et créer des apprenants pour le monde de demain.",
    cols: [
      {
        title: "Navigation",
        links: [
          { label: "Notre Mission", to: "/mission" },
          { label: "BrightSchool", to: "/" },
          { label: "Programmes académiques", to: "/#programs" },
        ],
      },
      {
        title: "Programmes",
        links: [
          { label: "Petite Section", to: "/#programs" },
          { label: "Élémentaire Moyen", to: "/#programs" },
          { label: "Élémentaire Supérieur", to: "/#programs" },
          { label: "Parascolaire", to: "/#programs" },
        ],
      },
      {
        title: "À propos",
        links: [
          { label: "Contact", to: "/contact" },
          { label: "Qui sommes-nous", to: "/mission" },
          { label: "Nos enseignants", to: "/mission" },
          { label: "Carrières", to: "/contact" },
        ],
      },
      {
        title: "Ressources",
        links: [
          { label: "Portail Élève", to: "/contact" },
          { label: "Actualités", to: "/news" },
          { label: "Calendrier scolaire", to: "/contact" },
        ],
      },
    ],
    copy: "Copyright 2025, BrightSchool. Tous droits réservés.",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
  },
};

export default function Footer() {
  const { lang } = useLanguage();
  const t = content[lang];
  return (
    <footer
      style={{
        background: "var(--cream-dark)",
        borderTop: "1px solid rgba(196,96,26,0.1)",
        paddingTop: 64,
        paddingBottom: 32,
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
              }}
            >
              <img
                src="/star.png" // Le chemin part directement du dossier public
                alt="HotelHub Logo"
                width={100} // Largeur fixe en pixels (ex: 40px)
                height={100} // Hauteur fixe en pixels
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
            <p
              style={{
                fontSize: 13,
                color: "var(--text-light)",
                lineHeight: 1.7,
                maxWidth: 240,
              }}
            >
              {t.tagline}
            </p>
          </div>
          {/* Cols */}
          {t.cols.map((col) => (
            <div key={col.title}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-dark)",
                  marginBottom: 16,
                }}
              >
                {col.title}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.to}
                      style={{
                        fontSize: 13,
                        color: "var(--text-light)",
                        textDecoration: "none",
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid rgba(26,18,8,0.08)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-light)" }}>{t.copy}</p>
          <div style={{ display: "flex", gap: 24 }}>
            {[t.privacy, t.terms].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: 12,
                  color: "var(--text-light)",
                  textDecoration: "none",
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
