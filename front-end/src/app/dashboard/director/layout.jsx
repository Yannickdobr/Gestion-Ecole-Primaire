"use client";
// Console d'administration réservée aux comptes Admin
import RequireAuth from "@/components/RequireAuth";
import TopNav from "@/components/TopNav";
import {
  Home, CalendarDays, GraduationCap, Users, Layers, ClipboardCheck,
  FileText, UserCheck, CreditCard, MessageSquare, Settings, HelpCircle,
  Award, ShieldAlert, BookOpen,
} from "lucide-react";

// manager:true → réservé à la direction (caché pour l'Admin standard)
const ITEMS = [
  { tkey: "accueil", label: "Accueil", href: "/dashboard/director", icon: <Home size={18} /> },
  { tkey: "schedule", label: "Emploi du temps", href: "/dashboard/director/schedule", icon: <CalendarDays size={18} /> },
  { tkey: "students", label: "Élèves", href: "/dashboard/director/students", icon: <GraduationCap size={18} /> },
  { tkey: "staff", label: "Personnel", href: "/dashboard/director/staff", icon: <Users size={18} />, manager: true },
  { tkey: "academic", label: "Académique", href: "/dashboard/director/academic", icon: <Layers size={18} />, manager: true },
  { tkey: "grades", label: "Évaluations", href: "/dashboard/director/grades", icon: <ClipboardCheck size={18} /> },
  { tkey: "bulletins", label: "Bulletins", href: "/dashboard/director/bulletins", icon: <Award size={18} /> },
  { tkey: "discipline", label: "Discipline", href: "/dashboard/director/discipline", icon: <ShieldAlert size={18} /> },
  { tkey: "bibliotheque", label: "Bibliothèque", href: "/dashboard/director/bibliotheque", icon: <BookOpen size={18} /> },
  { tkey: "payments", label: "Paiements", href: "/dashboard/director/payments", icon: <CreditCard size={18} /> },
  { tkey: "messages", label: "Messagerie", href: "/dashboard/director/messages", icon: <MessageSquare size={18} /> },
  { tkey: "profile", label: "Profil", href: "/dashboard/director/profile", icon: <UserCheck size={18} /> },
  { tkey: "forms", label: "Formulaires", href: "/dashboard/director/forms", icon: <FileText size={18} /> },
];

const ACCOUNT = [
  { tkey: "settings", label: "Paramètres", href: "/dashboard/director/settings", icon: <Settings size={16} /> },
  { tkey: "help", label: "Aide", href: "/dashboard/director/help", icon: <HelpCircle size={16} /> },
];

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth role="admin">
      <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text-dark)", fontFamily: "var(--font-body)" }}>
        <TopNav brandKey="brandAdmin" brand="Administration" items={ITEMS} accountItems={ACCOUNT} />
        <main style={{ maxWidth: 1300, margin: "0 auto", padding: "32px" }}>{children}</main>
      </div>
    </RequireAuth>
  );
}
