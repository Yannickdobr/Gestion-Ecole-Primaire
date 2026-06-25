"use client";

import ChangePassword from "@/components/ChangePassword";

export default function AutresPasswordPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 24 }}>
        Mon mot de passe
      </h1>
      <ChangePassword />
    </div>
  );
}
