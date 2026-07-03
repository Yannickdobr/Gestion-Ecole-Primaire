"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Users2, Search, X, GraduationCap, UserCog, FileWarning, MailWarning } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useActiveYear } from "@/context/ActiveYearContext";
import { estManager } from "@/lib/roles";
import { getTitulaires, getEleves, getPersonnesTous, getMesMessages, getJustificatifs } from "@/lib/api";
import { TranslatingButton } from "@/components/TranslatingButton";

export default function TopNav({ brand, brandKey, items = [], accountItems = [], maClasseHref }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { annees, anneeId, setAnnee } = useActiveYear();
  const tr = (key, fallback) => t?.topnav?.[key] ?? fallback;
  const isAdmin = user?.role === "admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const [estTitulaire, setEstTitulaire] = useState(false);
  const menuRef = useRef(null);

  // Recherche globale
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [annuaire, setAnnuaire] = useState(null); // { eleves, personnes }
  const searchInputRef = useRef(null);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!user?.id || !maClasseHref) return;
    let actif = true;
    getTitulaires()
      .then((tits) => { if (actif) setEstTitulaire((Array.isArray(tits) ? tits : []).some((x) => Number(x.personne?.idPers) === Number(user.id))); })
      .catch(() => {});
    return () => { actif = false; };
  }, [user?.id, maClasseHref]);

  // Notifications dérivées (brouillons + justificatifs à valider pour les admins)
  useEffect(() => {
    if (!user?.id) return;
    let actif = true;
    (async () => {
      const list = [];
      try {
        const msgs = await getMesMessages();
        (Array.isArray(msgs) ? msgs : []).filter((m) => Number(m.valider) === 0).forEach((m) =>
          list.push({ type: "draft", icon: <MailWarning size={15} />, texte: `Brouillon : ${m.objet}`, href: "/dashboard/director/messages" }));
      } catch {}
      if (isAdmin) {
        try {
          const js = await getJustificatifs();
          const enAttente = (Array.isArray(js) ? js : []).filter((j) => !j.idDirecteur).length;
          if (enAttente > 0) list.push({ type: "justif", icon: <FileWarning size={15} />, texte: `${enAttente} justificatif(s) à valider`, href: "/dashboard/director/justificatifs" });
        } catch {}
      }
      if (actif) setNotifs(list);
    })();
    return () => { actif = false; };
  }, [user?.id, isAdmin]);

  // Fermeture au clic extérieur
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Charge l'annuaire à la 1ère ouverture de la recherche
  const ouvrirRecherche = async () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
    if (!annuaire) {
      try {
        const [el, pe] = await Promise.all([getEleves().catch(() => []), getPersonnesTous().catch(() => [])]);
        setAnnuaire({ eleves: Array.isArray(el) ? el : [], personnes: Array.isArray(pe) ? pe : [] });
      } catch { setAnnuaire({ eleves: [], personnes: [] }); }
    }
  };

  const resultats = (() => {
    const term = q.trim().toLowerCase();
    if (!term || !annuaire) return [];
    const out = [];
    for (const e of annuaire.eleves) {
      if (`${e.prenom} ${e.nom}`.toLowerCase().includes(term) || String(e.matricule).includes(term))
        out.push({ key: `el-${e.matricule}`, icon: <GraduationCap size={15} />, label: `${e.prenom} ${e.nom}`, sous: `Élève #${e.matricule}`, href: `/dashboard/director/eleve/${e.matricule}` });
      if (out.length >= 12) break;
    }
    for (const p of annuaire.personnes) {
      if (out.length >= 12) break;
      if (`${p.prenom} ${p.nom}`.toLowerCase().includes(term))
        out.push({ key: `pe-${p.idPers}`, icon: <UserCog size={15} />, label: `${p.prenom} ${p.nom}`, sous: "Personnel", href: "/dashboard/director/staff" });
    }
    return out;
  })();

  const aller = (href) => { setSearchOpen(false); setQ(""); router.push(href); };

  let navItems = items.filter((it) => !it.manager || estManager(user));
  if (estTitulaire && maClasseHref) navItems = [...navItems, { tkey: "maClasse", label: "Ma classe", href: maClasseHref, icon: <Users2 size={18} /> }];

  const activeHref = navItems.reduce((best, it) => {
    const match = pathname === it.href || pathname.startsWith(it.href + "/");
    return match && it.href.length > best.length ? it.href : best;
  }, "");

  const nomCompte = user?.nom || user?.username || "Mon compte";
  const initiales = nomCompte.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]).join("").toUpperCase() || "?";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 200,
      display: "flex", alignItems: "center", gap: 18,
      padding: "12px 28px",
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--surface-border)", boxShadow: "var(--elev-1)",
    }}>
      <Link href={navItems[0]?.href || "#"} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
        <img src="/star.png" alt="BrightSchool" style={{ width: 30, height: 30 }} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--orange)", fontFamily: "var(--font-display)", lineHeight: 1 }}>BrightSchool</div>
          {(brandKey || brand) && <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{tr(brandKey, brand)}</div>}
        </div>
      </Link>

      <nav style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "2px 0", flexWrap: "wrap" }}>
        {navItems.map(({ tkey, label, href, icon }) => {
          const active = href === activeHref;
          return (
            <Link key={href} href={href} aria-label={tr(tkey, label)} className={active ? "topnav-link topnav-link--active" : "topnav-link"} style={{
              position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 38, borderRadius: 10, textDecoration: "none",
              color: active ? "var(--orange)" : "var(--muted)", background: active ? "rgba(216,99,16,0.12)" : "transparent",
            }}>
              {icon}<span className="topnav-tip">{tr(tkey, label)}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        {/* #8 Année active */}
        {annees.length > 0 && (
          <select value={anneeId ?? ""} onChange={(e) => setAnnee(e.target.value)} title="Année scolaire active"
            style={{ padding: "7px 10px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "rgba(216,99,16,0.06)", color: "var(--text-dark)", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
            {annees.map((a) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
          </select>
        )}

        {/* #6 Recherche */}
        {isAdmin && (
          <button onClick={ouvrirRecherche} title="Recherche globale" style={iconBtn}>
            <Search size={19} color="var(--muted)" />
          </button>
        )}

        {/* #6 Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button onClick={() => setNotifOpen((o) => !o)} title="Notifications" style={iconBtn}>
            <Bell size={20} color="var(--muted)" />
            {notifs.length > 0 && <span style={{ position: "absolute", top: 2, right: 2, minWidth: 15, height: 15, padding: "0 3px", background: "#ef4444", color: "white", borderRadius: 999, fontSize: 9.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--surface)" }}>{notifs.length}</span>}
          </button>
          {notifOpen && (
            <div style={dropdown}>
              <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--surface-border)", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>Notifications</div>
              {notifs.length === 0 ? (
                <div style={{ padding: "14px 12px", color: "var(--muted)", fontSize: 13 }}>Aucune notification.</div>
              ) : notifs.map((n, i) => (
                <Link key={i} href={n.href} onClick={() => setNotifOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "var(--text-dark)", fontSize: 13 }}>
                  <span style={{ color: "var(--orange)" }}>{n.icon}</span>{n.texte}
                </Link>
              ))}
            </div>
          )}
        </div>

        <TranslatingButton />

        {/* Compte */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", padding: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--brown))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>{initiales}</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nomCompte}</span>
            <ChevronDown size={14} color="var(--muted)" style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {menuOpen && (
            <div style={dropdown}>
              <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--surface-border)", marginBottom: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nomCompte}</div>
                {user?.username && user.username !== nomCompte && <div style={{ fontSize: 11.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.username}</div>}
              </div>
              {accountItems.map(({ tkey, label, href, icon }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "var(--text-dark)", fontSize: 13.5, fontWeight: 500 }}>
                  {icon}<span>{tr(tkey, label)}</span>
                </Link>
              ))}
              <button onClick={() => { setMenuOpen(false); logout(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#ef4444", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 2 }}>
                <LogOut size={16} /> {tr("logout", "Déconnexion")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* #6 Overlay de recherche */}
      {searchOpen && (
        <div onClick={() => setSearchOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.4)", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "12vh", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--surface-border)" }}>
              <Search size={18} color="var(--muted)" />
              <input ref={searchInputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un élève ou un membre du personnel…"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", background: "transparent", color: "var(--text-dark)" }} />
              <button onClick={() => setSearchOpen(false)} style={iconBtn}><X size={18} color="var(--muted)" /></button>
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {!q.trim() ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Tape un nom ou un matricule…</div>
              ) : resultats.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>{annuaire ? "Aucun résultat." : "Chargement…"}</div>
              ) : resultats.map((r) => (
                <button key={r.key} onClick={() => aller(r.href)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", border: "none", borderBottom: "1px solid var(--surface-border)", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ color: "var(--orange)" }}>{r.icon}</span>
                  <span style={{ flex: 1 }}><span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>{r.label}</span><span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{r.sous}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const iconBtn = { position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8 };
const dropdown = { position: "absolute", right: 0, top: "calc(100% + 10px)", minWidth: 240, maxWidth: 320, background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 14, boxShadow: "var(--elev-3)", padding: 8, zIndex: 300 };
