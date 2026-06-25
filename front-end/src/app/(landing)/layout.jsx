"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/styles/global.css";
import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({ children }) {
  return (
    <>
      <LanguageProvider>
        <Navbar />
        <main style={{ paddingTop: 68 }}>{children}</main>
        <Footer />
      </LanguageProvider>
    </>
  );
}
