"use client";

import RequireAuth from "@/components/RequireAuth";
import TopNav from "@/components/TopNav";
import { Home, CalendarDays, ClipboardCheck, MessageSquare, KeyRound, UserCheck, Award } from "lucide-react";

const ITEMS = [
  { tkey: "accueil", label: "Accueil", href: "/dashboard/teacher", icon: <Home size={18} /> },
  { tkey: "schedule", label: "Emploi du temps", href: "/dashboard/teacher/schedule", icon: <CalendarDays size={18} /> },
  { tkey: "grades", label: "Évaluations", href: "/dashboard/teacher/grades", icon: <ClipboardCheck size={18} /> },
  { tkey: "appel", label: "Appel", href: "/dashboard/teacher/appel", icon: <UserCheck size={18} /> },
  { tkey: "bulletins", label: "Bulletins", href: "/dashboard/teacher/bulletins", icon: <Award size={18} /> },
  { tkey: "messages", label: "Messagerie", href: "/dashboard/teacher/messages", icon: <MessageSquare size={18} /> },
];

const ACCOUNT = [
  { tkey: "password", label: "Mot de passe", href: "/dashboard/teacher/password", icon: <KeyRound size={16} /> },
];

export default function TeacherLayout({ children }) {
  return (
    <RequireAuth role="personne" typeRoles={[1]}>
      <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text-dark)", fontFamily: "var(--font-body)" }}>
        <TopNav brandKey="brandTeacher" brand="Espace Enseignant" items={ITEMS} accountItems={ACCOUNT} maClasseHref="/dashboard/teacher/ma-classe" />
        <main style={{ maxWidth: 1300, margin: "0 auto", padding: "32px" }}>{children}</main>
      </div>
    </RequireAuth>
  );
}
