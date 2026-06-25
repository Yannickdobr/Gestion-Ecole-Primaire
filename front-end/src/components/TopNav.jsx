"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Users2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { estManager } from "@/lib/roles";
import { getTitulaires } from "@/lib/api";
import { TranslatingButton } from "@/components/TranslatingButton";

/**
 * Barre de navigation horizontale unique pour tous les dashboards.
 * Props :
 *   brand        : sous-titre de l'espace (ex: "Espace Enseignant")
 *   items        : [{ label, href, icon, manager? }] — outils principaux (manager:true = caché pour l'Admin standard)
 *   accountItems : [{ label, href, icon }] — outils secondaires (Paramètres, Aide, Mot de passe) placés dans le menu du compte
 *   maClasseHref : si la personne connectée est titulaire, ajoute « Ma classe »
 */
export default function TopNav({ brand, brandKey, items = [], accountItems = [], maClasseHref }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const tr = (key, fallback) => t?.topnav?.[key] ?? fallback; // i18n avec repli français
  const [menuOpen, setMenuOpen] = useState(false);
  const [estTitulaire, setEstTitulaire] = useState(false);
  const menuRef = useRef(null);

  // « Ma classe » uniquement si la personne connectée est titulaire
  useEffect(() => {
    if (!user?.id || !maClasseHref) return;
    let actif = true;
    getTitulaires()
      .then((tits) => {
        if (!actif) return;
        setEstTitulaire((Array.isArray(tits) ? tits : []).some((t) => Number(t.personne?.idPers) === Number(user.id)));
      })
      .catch(() => {});
    return () => { actif = false; };
  }, [user?.id, maClasseHref]);

  // Ferme le menu compte au clic extérieur
  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  let navItems = items.filter((it) => !it.manager || estManager(user));
  if (estTitulaire && maClasseHref) {
    navItems = [...navItems, { tkey: "maClasse", label: "Ma classe", href: maClasseHref, icon: <Users2 size={18} /> }];
  }

  // Onglet actif = correspondance la plus spécifique (évite que « Accueil » soit toujours actif)
  const activeHref = navItems.reduce((best, it) => {
    const match = pathname === it.href || pathname.startsWith(it.href + "/");
    return match && it.href.length > best.length ? it.href : best;
  }, "");

  const nomCompte = user?.nom || user?.username || "Mon compte";
  const initiales = nomCompte.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]).join("").toUpperCase() || "?";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 200,
      display: "flex", alignItems: "center", gap: 20,
      padding: "12px 28px", background: "var(--surface)",
      borderBottom: "1px solid var(--surface-border)",
    }}>
      {/* Logo */}
      <Link href={navItems[0]?.href || "#"} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
        <img src="/star.png" alt="BrightSchool" style={{ width: 30, height: 30 }} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--orange)", fontFamily: "var(--font-display)", lineHeight: 1 }}>BrightSchool</div>
          {(brandKey || brand) && <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{tr(brandKey, brand)}</div>}
        </div>
      </Link>

      {/* Outils (nav horizontale) */}
      <nav style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, overflowX: "auto", padding: "2px 0" }}>
        {navItems.map(({ tkey, label, href, icon }) => {
          const active = href === activeHref;
          return (
            <Link key={href} href={href} style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10,
              textDecoration: "none", whiteSpace: "nowrap",
              color: active ? "var(--orange)" : "var(--muted)",
              background: active ? "rgba(216,99,16,0.12)" : "transparent",
              fontWeight: active ? 600 : 500, fontSize: 13.5, transition: "all 0.2s",
            }}>
              {icon}<span>{tr(tkey, label)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Actions à droite */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
        <TranslatingButton />
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={20} color="var(--muted)" />
          <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid var(--surface)" }} />
        </div>

        {/* Compte + menu déroulant */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen((o) => !o)} style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            background: "none", border: "none", fontFamily: "inherit", padding: 0,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--brown))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>
              {initiales}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nomCompte}</span>
            <ChevronDown size={14} color="var(--muted)" style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 10px)", minWidth: 210,
              background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 14,
              boxShadow: "0 16px 40px rgba(0,0,0,0.14)", padding: 8, zIndex: 300,
            }}>
              <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--surface-border)", marginBottom: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nomCompte}</div>
                {user?.username && user.username !== nomCompte && (
                  <div style={{ fontSize: 11.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.username}</div>
                )}
              </div>
              {accountItems.map(({ tkey, label, href, icon }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10,
                  textDecoration: "none", color: "var(--text-dark)", fontSize: 13.5, fontWeight: 500,
                }}>
                  {icon}<span>{tr(tkey, label)}</span>
                </Link>
              ))}
              <button onClick={() => { setMenuOpen(false); logout(); }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10,
                border: "none", background: "transparent", color: "#ef4444", fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", marginTop: 2,
              }}>
                <LogOut size={16} /> {tr("logout", "Déconnexion")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
