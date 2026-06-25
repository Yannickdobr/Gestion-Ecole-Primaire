"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage, getIconComponent } from "@/context/LanguageContext"; // Ensure path matches your setup

const partners = ["MIT", "UC Berkeley", "UNICEF", "Allianz", "Education+"];

export default function HomePage() {
  const { t } = useLanguage();
  const homeT = t.home; 
  
  const [testiIdx, setTestiIdx] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Fallback in case context hasn't loaded yet
  if (!homeT) return null; 

  return (
    <div>
      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=85')",
            backgroundSize: "cover",
            backgroundPosition: "bottom 100%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom right, rgba(15,10,5,0.55) 0%, rgba(80,30,10,0.45) 100%)",
            zIndex: 1,
          }}
        />
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            paddingBottom: 72,
            paddingTop: 140,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              alignItems: "flex-end",
            }}
          >
            <div>
              <span
                className="hero-line-wrapper"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "white",
                  marginBottom: 24,
                  display: "inline-flex",
                }}
              >
                {homeT.heroBadge}
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.15,
                  whiteSpace: "pre-line",
                }}
              >
                {homeT.heroTitle}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  maxWidth: 340,
                }}
              >
                {homeT.heroDesc}
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <Link href="/#programs" className="btn-outline-white">
                  {homeT.heroCTA1}
                </Link>
                <Link href="/login" className="btn-primary">
                  {homeT.heroCTA2}
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Partners strip */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "rgba(245,240,234,0.97)",
            borderTop: "1px solid rgba(196,96,26,0.1)",
            padding: "20px 0",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            {partners.map((p) => (
              <span
                key={p}
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-light)",
                  letterSpacing: "0.03em",
                  opacity: 0.7,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section" id="about">
        <div className="container">
          <span
            className="hero-line-wrapper"
            style={{ marginBottom: 32, display: "inline-flex" }}
          >
            {homeT.aboutBadge}
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "start",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 700,
                lineHeight: 1.25,
                color: "var(--text-dark)",
              }}
            >
              {homeT.aboutTitle}
            </h2>
            <div>
              <p
                style={{
                  color: "var(--text-mid)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  marginBottom: 32,
                }}
              >
                {homeT.aboutDesc}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {homeT.features.map((f, index) => {
                  const IconComponent = getIconComponent(f.iconName);
                  const isThisCardHovered =
                    typeof hoveredIndex !== "undefined" &&
                    hoveredIndex === index;

                  return (
                    <div
                      key={f.title}
                      onMouseEnter={() =>
                        typeof setHoveredIndex === "function" &&
                        setHoveredIndex(index)
                      }
                      onMouseLeave={() =>
                        typeof setHoveredIndex === "function" &&
                        setHoveredIndex(null)
                      }
                      style={{
                        position: "relative",
                        background: "var(--cream-light, #FDFBF7)",
                        padding: "32px 24px",
                        borderRadius: "24px 4px 24px 4px",
                        borderTop: "1px solid transparent",
                        borderLeft: "1px solid transparent",
                        borderRight: isThisCardHovered
                          ? "1.5px solid var(--orange)"
                          : "1.5px solid #E5E4E2",
                        borderBottom: isThisCardHovered
                          ? "1.5px solid var(--orange)"
                          : "1.5px solid #E5E4E2",
                        transform: isThisCardHovered
                          ? "translateY(-8px)"
                          : "translateY(0)",
                        boxShadow: isThisCardHovered
                          ? "0 16px 32px -12px rgba(196, 96, 26, 0.18)"
                          : "0 4px 12px -4px rgba(0,0,0,0.03)",
                        transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: "12px 4px 12px 4px",
                          background: "var(--orange-pale)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 20,
                        }}
                      >
                        {IconComponent ? (
                          <IconComponent
                            size={35}
                            strokeWidth={1.8}
                            style={{ color: "var(--orange)" }}
                          />
                        ) : null}
                      </div>

                      <h4
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--text-dark)",
                          marginBottom: 8,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {f.title}
                      </h4>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-mid)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section
        className="section"
        style={{ background: "var(--cream-dark)" }}
        id="facilities"
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            <div style={{ borderRadius: 20, overflow: "hidden", height: 420 }}>
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=85"
                alt="Classroom"
                style={{
                  objectPosition: "bottom",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <span
                className="hero-line-wrapper"
                style={{ marginBottom: 20, display: "inline-flex" }}
              >
                {homeT.facilitiesBadge}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: "var(--text-dark)",
                  marginBottom: 16,
                }}
              >
                {homeT.facilitiesTitle}
              </h2>
              <p
                style={{
                  color: "var(--text-mid)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  marginBottom: 32,
                }}
              >
                {homeT.facilitiesDesc}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {homeT.facilities.map((f) => {
                  const IconComponent = getIconComponent(f.iconName);

                  return (
                    <div key={f.title}>
                      <div style={{ marginBottom: 8, color: "var(--orange)" }}>
                        {IconComponent ? (
                          <IconComponent size={24} strokeWidth={2} />
                        ) : null}
                      </div>
                      <h4
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-dark)",
                          marginBottom: 6,
                        }}
                      >
                        {f.title}
                      </h4>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-light)",
                          lineHeight: 1.6,
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="section" id="programs">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <span
              className="hero-line-wrapper"
              style={{ marginBottom: 20, display: "inline-flex" }}
            >
              {homeT.programsBadge}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "var(--text-dark)",
                marginBottom: 16,
              }}
            >
              {homeT.programsTitle}
            </h2>
            <p
              style={{
                color: "var(--text-mid)",
                fontSize: 15,
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              {homeT.programsDesc}
            </p>
          </div>
          {homeT.programs.map((prog, i) => (
            <div key={prog.tag} className="programme-row">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  order: i % 2 === 0 ? 0 : 1,
                }}
              >
                <span
                  className="hero-line-wrapper"
                  style={{ alignSelf: "flex-start" }}
                >
                  {prog.tag}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
                    fontWeight: 600,
                    color: "var(--text-dark)",
                    lineHeight: 1.3,
                  }}
                >
                  {prog.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-mid)",
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  {prog.desc}
                </p>
              </div>
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  height: 380,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                  order: i % 2 === 0 ? 1 : 0,
                }}
              >
                <img
                  src={prog.img}
                  alt={prog.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section" style={{ background: "var(--cream-dark)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                height: 380,
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={homeT.testimonials[testiIdx].img}
                alt={homeT.testimonials[testiIdx].name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <span
                className="hero-line-wrapper"
                style={{ marginBottom: 28, display: "inline-flex" }}
              >
                {homeT.testiLabel}
              </span>
              <blockquote
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.1rem, 2vw, 1.45rem)",
                  fontWeight: 400,
                  color: "var(--text-dark)",
                  lineHeight: 1.65,
                  marginBottom: 32,
                  fontStyle: "italic",
                }}
              >
                "{homeT.testimonials[testiIdx].quote}"
              </blockquote>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--text-dark)",
                  fontSize: 15,
                }}
              >
                {homeT.testimonials[testiIdx].name}
              </p>
              <p
                style={{
                  color: "var(--text-light)",
                  fontSize: 13,
                  marginBottom: 28,
                }}
              >
                {homeT.testimonials[testiIdx].role}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="testi-btn"
                  onClick={() =>
                    setTestiIdx(
                      (testiIdx - 1 + homeT.testimonials.length) %
                        homeT.testimonials.length,
                    )
                  }
                >
                  ←
                </button>
                <button
                  className="testi-btn active"
                  onClick={() =>
                    setTestiIdx((testiIdx + 1) % homeT.testimonials.length)
                  }
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <span
            className="hero-line-wrapper"
            style={{ marginBottom: 20, display: "inline-flex" }}
          >
            {homeT.whatMakesUs}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--text-dark)",
              marginBottom: 16,
              whiteSpace: "pre-line",
            }}
          >
            {homeT.statsTitle}
          </h2>
          <p
            style={{
              color: "var(--text-mid)",
              fontSize: 15,
              maxWidth: 520,
              margin: "0 auto 56px",
            }}
          >
            {homeT.statsDesc}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 40,
            }}
          >
            {homeT.stats.map((s) => (
              <div key={s.label}>
                <div className="stat-number">{s.value}</div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-light)",
                    marginTop: 8,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS ── */}
      <section className="section" style={{ background: "var(--cream-dark)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 80,
              alignItems: "start",
            }}
          >
            <div style={{ position: "sticky", top: 100 }}>
              <span
                className="hero-line-wrapper"
                style={{ marginBottom: 20, display: "inline-flex" }}
              >
                {homeT.newsBadge}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  lineHeight: 1.25,
                  marginBottom: 20,
                  whiteSpace: "pre-line",
                }}
              >
                {homeT.newsTitle}
              </h2>
              <p
                style={{
                  color: "var(--text-mid)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                {homeT.newsDesc}
              </p>
              <Link href="/news" className="btn-outline">
                {homeT.newsBtn}
              </Link>
            </div>
            <div>
              {homeT.news.map((item) => (
                <div key={item.title} className="news-card">
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      height: 140,
                    }}
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.15rem",
                        fontWeight: 600,
                        color: "var(--text-dark)",
                        marginBottom: 10,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-mid)",
                        lineHeight: 1.7,
                        marginBottom: 16,
                      }}
                    >
                      {item.desc}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{ fontSize: 12, color: "var(--text-light)" }}
                      >
                        {item.date}
                      </span>
                      <Link
                        href="/news"
                        className="btn-primary"
                        style={{ fontSize: 12, padding: "7px 16px" }}
                      >
                        {homeT.learnMore}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section
        style={{
          position: "relative",
          minHeight: 320,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #C4601A 0%, #7A3B1E 60%, #2D1A0E 100%)",
            zIndex: 0,
          }}
        />
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
            padding: "64px 32px",
          }}
        >
          <div>
            <span
              className="hero-line-wrapper"
              style={{
                borderRadius: "999px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                marginBottom: 20,
                display: "inline-flex",
              }}
            >
              {homeT.joinUs}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.2,
                whiteSpace: "pre-line",
              }}
            >
              {homeT.heroBottom}
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {homeT.heroBottomDesc}
            </p>
            <Link href="/contact" className="btn-outline-white">
              {homeT.registerNow}
            </Link>
          </div>
        </div>
      </section>        
    </div>
  );
}