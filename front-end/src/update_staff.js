const fs = require('fs');
let file = 'app/dashboard/director/staff/page.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('ConfirmDeleteModal')) {
  // Add import
  content = content.replace(
    'import { Users, GraduationCap, UserCheck, Power, PowerOff, UserPlus, X, MapPin, Shield, Trash2 } from "lucide-react";',
    'import { Users, GraduationCap, UserCheck, Power, PowerOff, UserPlus, X, MapPin, Shield, Trash2 } from "lucide-react";\nimport ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";'
  );

  // Add state inside StaffPage
  content = content.replace(
    'const [error, setError] = useState("");',
    'const [error, setError] = useState("");\n  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, impact: [], message: "" });'
  );

  // Update supprimerPersonne
  const oldSupprimerPersonne = `  const supprimerPersonne = async (p) => {
    if (typeof window !== "undefined" && !window.confirm(\`Supprimer le compte de \${p.prenom} \${p.nom} ?\`)) return;
    setBusyId(\`per-\${p.idPers}\`); setError("");
    try {
      await deletePersonne(p.idPers);
      setPersonnes(await getPersonnesTous());
    } catch (e) { setError(e.message || "Suppression impossible."); }
    finally { setBusyId(null); }
  };`;
  
  const newSupprimerPersonne = `  const supprimerPersonne = async (p, force = false) => {
    if (typeof window !== "undefined" && !force && !window.confirm(\`Supprimer le compte de \${p.prenom} \${p.nom} ?\`)) return;
    setBusyId(\`per-\${p.idPers}\`); setError("");
    try {
      await deletePersonne(p.idPers, force);
      if (deleteModal.isOpen) setDeleteModal({ isOpen: false, item: null, impact: [], message: "" });
      setPersonnes(await getPersonnesTous());
    } catch (e) {
      if (e.requireConfirmation) {
         setDeleteModal({ isOpen: true, item: p, impact: e.impact, message: e.message });
      } else {
         setError(e.message || "Suppression impossible.");
      }
    }
    finally { setBusyId(null); }
  };`;
  
  content = content.replace(oldSupprimerPersonne, newSupprimerPersonne);

  // Add Modal JSX below DashboardHeader
  content = content.replace(
    '<DashboardHeader title="Personnel & Comptes" subtitle="Gérez les enseignants, le personnel administratif et les administrateurs" />',
    '<DashboardHeader title="Personnel & Comptes" subtitle="Gérez les enseignants, le personnel administratif et les administrateurs" />\n      <ConfirmDeleteModal\n        isOpen={deleteModal.isOpen}\n        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}\n        onConfirm={() => supprimerPersonne(deleteModal.item, true)}\n        impact={deleteModal.impact}\n        message={deleteModal.message}\n      />'
  );

  fs.writeFileSync(file, content);
  console.log('done');
}
