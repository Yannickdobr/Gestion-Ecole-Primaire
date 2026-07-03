"use client";

import RequireAuth from "@/components/RequireAuth";
import TopNav from "@/components/TopNav";
import { Home, MessageSquare, KeyRound, LibraryBig, ShieldAlert } from "lucide-react";

const ITEMS = [
  { tkey: "accueil", label: "Accueil", href: "/dashboard/autres", icon: <Home size={18} /> },
  { tkey: "discipline", label: "Discipline", href: "/dashboard/autres/discipline", icon: <ShieldAlert size={18} /> },
  { tkey: "bibliotheque", label: "Bibliothèque", href: "/dashboard/autres/bibliotheque", icon: <LibraryBig size={18} /> },
  { tkey: "messages", label: "Messagerie", href: "/dashboard/autres/messages", icon: <MessageSquare size={18} /> },
];

const ACCOUNT = [
  { tkey: "password", label: "Mot de passe", href: "/dashboard/autres/password", icon: <KeyRound size={16} /> },
];

export default function AutresLayout({ children }) {
  // Espace réservé au personnel « Autres » (typePersonne 5)
  return (
    <RequireAuth role="personne" typeRoles={[5]}>
      <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text-dark)", fontFamily: "var(--font-body)" }}>
        <TopNav brandKey="brandAutres" brand="Espace Personnel" items={ITEMS} accountItems={ACCOUNT} maClasseHref="/dashboard/autres/ma-classe" />
        <main style={{ maxWidth: 1300, margin: "0 auto", padding: "32px" }}>{children}</main>
      </div>
    </RequireAuth>
  );
}
