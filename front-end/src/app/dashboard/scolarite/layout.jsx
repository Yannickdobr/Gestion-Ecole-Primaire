"use client";

import RequireAuth from "@/components/RequireAuth";
import TopNav from "@/components/TopNav";
import { Home, GraduationCap, CreditCard, MessageSquare, KeyRound, FileText } from "lucide-react";

const ITEMS = [
  { tkey: "accueil", label: "Accueil", href: "/dashboard/scolarite", icon: <Home size={18} /> },
  { tkey: "students", label: "Élèves", href: "/dashboard/scolarite/students", icon: <GraduationCap size={18} /> },
  { tkey: "payments", label: "Paiements", href: "/dashboard/scolarite/payments", icon: <CreditCard size={18} /> },
  { tkey: "documents", label: "Documents", href: "/dashboard/scolarite/documents", icon: <FileText size={18} /> },
  { tkey: "messages", label: "Messagerie", href: "/dashboard/scolarite/messages", icon: <MessageSquare size={18} /> },
];

const ACCOUNT = [
  { tkey: "password", label: "Mot de passe", href: "/dashboard/scolarite/password", icon: <KeyRound size={16} /> },
];

export default function ScolariteLayout({ children }) {
  // Espace réservé aux personnels Administratif (2) et Scolarité (3)
  return (
    <RequireAuth role="personne" typeRoles={[2, 3]}>
      <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text-dark)", fontFamily: "var(--font-body)" }}>
        <TopNav brandKey="brandScolarite" brand="Espace Scolarité" items={ITEMS} accountItems={ACCOUNT} maClasseHref="/dashboard/scolarite/ma-classe" />
        <main style={{ maxWidth: 1300, margin: "0 auto", padding: "32px" }}>{children}</main>
      </div>
    </RequireAuth>
  );
}
