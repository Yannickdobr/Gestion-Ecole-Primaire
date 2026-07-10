"use client";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, forgotPassword, getLoginStats } from "@/lib/api";
import { homePathFor } from "@/lib/roles";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // 2. Grab the login function

  // Fetch public stats for the UI
  const [stats, setStats] = useState({ nbEleves: 0, nbCoursAujourdhui: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    getLoginStats()
      .then(setStats)
      .catch((e) => { console.error("Erreur stats:", e); })
      .finally(() => setStatsLoading(false));
  }, []);

  // Génération de la semaine courante
  const generateCurrentWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Dimanche) à 6 (Samedi)
    // On veut commencer par Lundi (si Dimanche, on recule de 6 jours)
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const week = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push({
        label: labels[i],
        dayNumber: date.getDate(),
        isToday: date.toDateString() === today.toDateString()
      });
    }
    return week;
  };

  // La page /login est prérendue statiquement : sans recalcul côté client, la
  // bande de dates resterait figée à la date du build. On la recalcule donc au
  // montage pour qu'elle reflète TOUJOURS la date réelle du visiteur.
  const [currentWeek, setCurrentWeek] = useState(generateCurrentWeek);
  useEffect(() => {
    setCurrentWeek(generateCurrentWeek());
  }, []);

  // Mot de passe oublié
  const [fpOpen, setFpOpen] = useState(false);
  const [fpUsername, setFpUsername] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  const soumettreOubli = async (e) => {
    e.preventDefault();
    setFpLoading(true);
    setFpMsg("");
    try {
      const r = await forgotPassword(fpUsername.trim());
      setFpMsg(r?.message || "Si un compte correspond, un email a été envoyé.");
    } catch (err) {
      setFpMsg(err.message || "Une erreur est survenue.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation de base avant l'appel API
    if (!username || !password) {
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      // Appel réel au backend : POST /api/auth/login
      const result = await apiLogin(username.trim(), password);
      const { access_token, user: u } = result;

      // Stocke l'utilisateur + le token JWT dans le contexte/localStorage
      login(u, access_token);

      // Aiguillage selon le rôle (admin → directeur, enseignant → teacher,
      // administratif/scolarité → scolarite, parent → parent)
      window.location.replace(homePathFor(u));
    } catch (err) {
      // 401/404 du backend, ou serveur injoignable
      setError(err.message || "Nom d'utilisateur ou mot de passe incorrect.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f0ea 0%, #ede8e0 100%)",
        padding: "24px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          minHeight: 580,
          borderRadius: 28,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          boxShadow:
            "0 32px 80px rgba(26,18,8,0.18), 0 0 0 1px rgba(196,96,26,0.08)",
          background: "#fff",
        }}
      >
        {/* ── LEFT: Form Panel ── */}
        <div
          style={{
            padding: "52px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#fff",
            position: "relative",
          }}
        >
          {/* Logo */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 18px",
                borderRadius: 999,
                marginBottom: 44,
              }}
            >
              {" "}
              <Link
                href="/"
                className="cursor-pointer transition-opacity hover:opacity-90"
              >
                <span
                  className="hero-line-wrapper"
                  style={{
                    color: "var(--orange)",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.35)",
                    marginBottom: 24,
                    display: "inline-flex",
                  }}
                >
                  <img
                    src="/star.png" // Le chemin part directement du dossier public
                    alt="BrightSchool Logo"
                    width={200} // Largeur fixe en pixels (ex: 40px)
                    height={200} // Hauteur fixe en pixels
                    className="object-contain" // Assure que l'image ne soit pas déformée
                  />
                </span>{" "}
              </Link>
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.7rem, 3vw, 2.1rem)",
                fontWeight: 700,
                color: "#1a1208",
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              Bon retour parmi nous
            </h1>
            <p style={{ fontSize: 14, color: "#8a7060", marginBottom: 36 }}>
              Connectez-vous à votre espace personnel
            </p>

            {/* Form */}
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              {/* Username */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4a3728",
                    marginBottom: 7,
                    letterSpacing: "0.02em",
                  }}
                >
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex : marie.dupont"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${error ? "#ef4444" : "rgba(26,18,8,0.12)"}`,
                    fontSize: 14,
                    color: "#1a1208",
                    background: "#faf9f7",
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#d86310")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = error
                      ? "#ef4444"
                      : "rgba(26,18,8,0.12)")
                  }
                />
              </div>

              {/* Password */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 7,
                  }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#4a3728",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => { setFpUsername(username); setFpMsg(""); setFpOpen(true); }}
                    style={{
                      fontSize: 12,
                      color: "#d86310",
                      textDecoration: "none",
                      fontWeight: 500,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: 0,
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    style={{
                      width: "100%",
                      padding: "13px 48px 13px 16px",
                      borderRadius: 12,
                      border: `1.5px solid ${error ? "#ef4444" : "rgba(26,18,8,0.12)"}`,
                      fontSize: 14,
                      color: "#1a1208",
                      background: "#faf9f7",
                      outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#d86310")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = error
                        ? "#ef4444"
                        : "rgba(26,18,8,0.12)")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8a7060",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    fontSize: 13,
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: loading
                    ? "rgba(216,99,16,0.6)"
                    : "linear-gradient(135deg, #d86310 0%, #ac3b02 100%)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  letterSpacing: "0.01em",
                  marginTop: 4,
                  boxShadow: loading
                    ? "none"
                    : "0 4px 16px rgba(216,99,16,0.35)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  margin: "4px 0",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(26,18,8,0.1)",
                  }}
                />
                <span style={{ fontSize: 12, color: "#8a7060" }}>
                  ou continuer avec
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(26,18,8,0.1)",
                  }}
                />
              </div>

              {/* OAuth buttons */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {/* Apple Button */}
                <button
                  type="button"
                  style={{
                    padding: "11px 16px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(26,18,8,0.12)",
                    background: "#faf9f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1a1208",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d86310";
                    e.currentTarget.style.background = "#fff8f4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(26,18,8,0.12)";
                    e.currentTarget.style.background = "#faf9f7";
                  }}
                >
                  {/* Exact Apple SVG */}
                  <svg
                    width="14"
                    height="16"
                    viewBox="0 0 170 170"
                    fill="currentColor"
                  >
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.38.13-9.13-1.92-14.26-6.13-3.44-2.82-7.46-7.79-12.05-14.91-10.89-16.77-16.33-35.03-16.33-54.76 0-14.34 3.74-25.75 11.23-34.21 7.49-8.47 16.59-12.77 27.31-12.89 5.31 0 10.81 1.4 16.51 4.19 5.7 2.78 9.71 4.18 12.04 4.18 1.95 0 6.09-1.53 12.43-4.58 6.33-3.04 11.83-4.44 16.51-4.19 15.64 1.4 27.42 7.23 35.34 17.5-12.57 7.64-18.74 17.84-18.5 30.62.24 10.15 4.02 18.52 11.35 25.1 7.33 6.58 15.86 10.1 25.59 10.56-.63 2.73-1.63 5.72-3.02 8.97zM119.22 35.61c0-7.89 2.8-15.17 8.41-21.84 5.61-6.67 12.51-10.74 20.7-12.22.12 1 .18 1.86.18 2.59 0 7.49-2.91 14.7-8.73 21.65-5.82 6.95-12.83 11.23-21.03 12.83-.35-1.95-.53-3.95-.53-6.01z" />
                  </svg>
                  Apple
                </button>

                {/* Google Button */}
                <button
                  type="button"
                  style={{
                    padding: "11px 16px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(26,18,8,0.12)",
                    background: "#faf9f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1a1208",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d86310";
                    e.currentTarget.style.background = "#fff8f4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(26,18,8,0.12)";
                    e.currentTarget.style.background = "#faf9f7";
                  }}
                >
                  {/* Exact Google Colorful SVG */}
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.32 14.24A7.16 7.16 0 0 1 4.93 12c0-.79.13-1.57.39-2.31V6.54H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.46l4.11-3.22z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.46l4.11 3.22c.94-2.85 3.57-4.96 6.68-4.96z"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 32,
            }}
          >
            <a
              href="/contact"
              style={{ fontSize: 13, color: "#8a7060", textDecoration: "none" }}
            >
              Conditions d'utilisation
            </a>
          </div>
        </div>

        {/* ── RIGHT: Image Panel ── */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#1a1208",
          }}
        >
          {/* Background image */}
          <img
            src="https://plus.unsplash.com/premium_photo-1683121138638-258938b53330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWZyaWNhbiUyMGVsZW1lbnRhcnklMjBzY2hvb2x8ZW58MHx8MHx8fDA%3D"
            alt="Students"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(216,99,16,0.55) 0%, rgba(26,18,8,0.75) 70%)",
            }}
          />

          {/* Floating card: Today's stats */}
          <div
            style={{
              position: "absolute",
              top: 32,
              left: 24,
              right: 24,
              background: "rgba(255,255,255,0.96)",
              borderRadius: 16,
              padding: "16px 18px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1208" }}>
                BrightSchool Aujourd'hui
              </span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#d86310",
                }}
              />
            </div>
            
            {statsLoading ? (
              <span style={{ fontSize: 13, color: "#8a7060" }}>Chargement des statistiques...</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#8a7060" }}>Cours prévus ce jour :</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#d86310" }}>{stats.nbCoursAujourdhui}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#8a7060" }}>Élèves inscrits :</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{stats.nbEleves}</span>
                </div>
              </div>
            )}
          </div>

          {/* Week strip */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 24,
              right: 24,
              transform: "translateY(-50%)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {currentWeek.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: d.isToday ? "#d86310" : "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                  }}
                >
                  {d.label}
                </span>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 700,
                    color: d.isToday ? "#fff" : "white",
                    background: d.isToday
                      ? "linear-gradient(135deg, #d86310 0%, #ac3b02 100%)"
                      : "transparent",
                    border: d.isToday
                      ? "none"
                      : "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {d.dayNumber}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Modal : Mot de passe oublié ── */}
      {fpOpen && (
        <div
          onClick={() => !fpLoading && setFpOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 18, padding: 26, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1208", fontFamily: "var(--font-display)", marginBottom: 6 }}>Mot de passe oublié</h2>
            <p style={{ fontSize: 13, color: "#8a7060", marginBottom: 16 }}>
              Saisis ton identifiant (e-mail ou numéro de téléphone). Si un compte existe, un nouveau mot de passe te sera envoyé par e-mail ou par WhatsApp.
            </p>
            <form onSubmit={soumettreOubli}>
              <input
                type="text"
                value={fpUsername}
                onChange={(e) => setFpUsername(e.target.value)}
                placeholder="ton.email@exemple.com"
                autoComplete="username"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(26,18,8,0.12)", fontSize: 14, background: "#faf9f7", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              {fpMsg && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", fontSize: 13, color: "#15803d" }}>{fpMsg}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button type="button" onClick={() => setFpOpen(false)} disabled={fpLoading} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(26,18,8,0.12)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Fermer</button>
                <button type="submit" disabled={fpLoading || !fpUsername.trim()} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: (fpLoading || !fpUsername.trim()) ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, #d86310, #ac3b02)", color: "white", fontSize: 14, fontWeight: 600, cursor: (fpLoading || !fpUsername.trim()) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{fpLoading ? "Envoi…" : "Réinitialiser"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
