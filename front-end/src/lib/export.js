// Export CSV générique côté client (aucune dépendance, aucun appel BD).
// columns: [{ key | get, label }] — `get(row)` prioritaire sur `row[key]`.
function echappe(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exporterCSV(rows, columns, filename = "export.csv") {
  const entete = columns.map((c) => echappe(c.label)).join(";");
  const lignes = (rows || []).map((r) =>
    columns.map((c) => echappe(c.get ? c.get(r) : r[c.key])).join(";"),
  );
  // BOM UTF-8 pour qu'Excel affiche correctement les accents
  const contenu = "﻿" + [entete, ...lignes].join("\r\n");
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
