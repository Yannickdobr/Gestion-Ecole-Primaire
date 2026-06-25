"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare } from "lucide-react";

const CARTES = [
  { titre: "Messagerie", desc: "Communiquer avec les parents et l'administration.", href: "/dashboard/autres/messages", icon: <MessageSquare size={22} /> },
];

export default function AutresHome() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 6 }}>
        Bonjour {user?.nom || user?.username}
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 32 }}>Bienvenue dans votre espace personnel.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
        {CARTES.map((c) => (
          <Link key={c.href} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 24, height: "100%" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(216,99,16,0.1)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {c.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>{c.titre}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
