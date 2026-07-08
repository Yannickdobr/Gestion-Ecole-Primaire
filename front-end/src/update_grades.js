const fs = require('fs');
let file = 'app/dashboard/director/grades/page.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('ConfirmDeleteModal')) {
  // Add import
  content = content.replace(
    'import FileUpload from "@/components/FileUpload";',
    'import FileUpload from "@/components/FileUpload";\nimport ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";'
  );

  // Add state
  content = content.replace(
    'const [editModal, setEditModal] = useState({ type: null, data: null });',
    'const [editModal, setEditModal] = useState({ type: null, data: null });\n  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, impact: [], message: "" });'
  );

  // Update handleDelete
  const oldHandleDelete = `  const handleDelete = async (type, id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    try {
      if (type === 'annee') await deleteAnnee(id);
      else if (type === 'trim') await deleteTrimestre(id);
      else if (type === 'sess') await deleteSession(id);
      else if (type === 'nat') await deleteNature(id);
      else if (type === 'epr') await deleteEpreuve(id);
      await chargerTout();
    } catch (e) { alert(e.message || "Erreur lors de la suppression."); }
  };`;
  
  const newHandleDelete = `  const handleDelete = async (type, id, force = false) => {
    if (!force && !window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    try {
      if (type === 'annee') await deleteAnnee(id, force);
      else if (type === 'trim') await deleteTrimestre(id, force);
      else if (type === 'sess') await deleteSession(id, force);
      else if (type === 'nat') await deleteNature(id, force);
      else if (type === 'epr') await deleteEpreuve(id, force);
      
      if (deleteModal.isOpen) setDeleteModal({ isOpen: false, type: null, id: null, impact: [], message: "" });
      await chargerTout();
    } catch (e) {
      if (e.requireConfirmation) {
         setDeleteModal({ isOpen: true, type, id, impact: e.impact, message: e.message });
      } else {
         alert(e.message || "Erreur lors de la suppression.");
      }
    }
  };`;
  
  content = content.replace(oldHandleDelete, newHandleDelete);

  // Add modal JSX
  content = content.replace(
    '<DashboardHeader title="Évaluations & Notes" subtitle="Gestion des référentiels et des notes" />',
    '<DashboardHeader title="Évaluations & Notes" subtitle="Gestion des référentiels et des notes" />\n      <ConfirmDeleteModal\n        isOpen={deleteModal.isOpen}\n        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}\n        onConfirm={() => handleDelete(deleteModal.type, deleteModal.id, true)}\n        impact={deleteModal.impact}\n        message={deleteModal.message}\n      />'
  );

  fs.writeFileSync(file, content);
  console.log('done');
}
