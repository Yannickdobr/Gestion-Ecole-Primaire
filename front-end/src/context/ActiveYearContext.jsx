"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAnnees } from "@/lib/api";

const Ctx = createContext(null);
const STORAGE_KEY = "anneeActive";

export function ActiveYearProvider({ children }) {
  const [annees, setAnnees] = useState([]);
  const [anneeId, setAnneeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setLoading(false); return; }
    try {
      const data = await getAnnees();
      const list = Array.isArray(data) ? data : [];
      setAnnees(list);
      const saved = Number(localStorage.getItem(STORAGE_KEY)) || null;
      const valide = saved && list.some((x) => Number(x.idAnnee) === saved);
      const recente = list.reduce((acc, x) => (!acc || Number(x.idAnnee) > Number(acc.idAnnee) ? x : acc), null);
      setAnneeId(valide ? saved : (recente ? Number(recente.idAnnee) : null));
    } catch { /* non connecté ou aucune année */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const setAnnee = useCallback((id) => {
    const n = id ? Number(id) : null;
    setAnneeId(n);
    if (typeof window !== "undefined") {
      if (n) localStorage.setItem(STORAGE_KEY, String(n));
      else localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const annee = annees.find((a) => Number(a.idAnnee) === Number(anneeId)) || null;

  return (
    <Ctx.Provider value={{ annees, annee, anneeId, setAnnee, reload, loading }}>
      {children}
    </Ctx.Provider>
  );
}

// Hook avec valeurs par défaut sûres si aucun provider (évite les crashs sur pages publiques)
export function useActiveYear() {
  return useContext(Ctx) || { annees: [], annee: null, anneeId: null, setAnnee: () => {}, reload: () => {}, loading: false };
}
