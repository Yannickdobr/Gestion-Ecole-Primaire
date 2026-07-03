"use client";

import "@/styles/global.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ActiveYearProvider } from "@/context/ActiveYearContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>BrightSchool — Éducation d'Excellence</title>
        <meta
          name="description"
          content="BrightSchool est une école primaire progressive dédiée à l'excellence académique et au développement du caractère de chaque enfant."
        />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <ActiveYearProvider>
              <main>{children}</main>
            </ActiveYearProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
