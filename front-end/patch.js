const fs = require('fs');

function patchFile(file, componentName, deleteFnName, paramName, deleteApiName, loadFnName, itemLabel, onClickMatcher) {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('ConfirmDeleteModal')) {
    content = content.replace('import { DashboardHeader', 'import ConfirmDeleteModal from \"@/components/ui/ConfirmDeleteModal\";\nimport { DashboardHeader');
  }

  if (!content.includes('deleteModal')) {
    content = content.replace('const [error, setError] = useState(\"\");', 'const [error, setError] = useState(\"\");\n  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, impact: [], message: \"\" });');
  }

  // Rewrite the delete function
  const regex = new RegExp(\const \ = async \\\([^\\}]*finally \\{\\s*.*\\s*\\}\\s*\\};\, 's');
  
  const newFn = \const \ = async (\, force = false) => {
    setBusyId(\.id || \.idLivre || \.idTrimes || \.idMsg || \.idSession || \.idScolarite || \);
    try {
      await \(\.id || \.idLivre || \.idTrimes || \.idMsg || \.idSession || \.idScolarite || \, force);
      if (deleteModal.isOpen) setDeleteModal({ isOpen: false, item: null, impact: [], message: \"\" });
      await \();
    } catch (e) {
      if (e.requireConfirmation) {
        setDeleteModal({ isOpen: true, item: \, impact: e.impact, message: e.message });
      } else {
        alert(e.message || \"Échec de la suppression.\");
      }
    } finally {
      setBusyId(null);
    }
  };\;
  
  content = content.replace(regex, newFn);
  content = content.replace(onClickMatcher.old, onClickMatcher.new);

  if (!content.includes('<ConfirmDeleteModal')) {
    content = content.replace('</DashboardHeader>', \</DashboardHeader>\n      <ConfirmDeleteModal\n        isOpen={deleteModal.isOpen}\n        title=\"Confirmation de suppression\"\n        message={deleteModal.message}\n        impact={deleteModal.impact}\n        onClose={() => setDeleteModal({ isOpen: false, item: null, impact: [], message: \"\" })}\n        onConfirm={() => \(deleteModal.item, deleteModal.impact && deleteModal.impact.length > 0)}\n      />\);
  }

  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}

// 1. bibliotheque
patchFile(
  'src/app/dashboard/autres/bibliotheque/page.jsx', 
  'BibliothequePage', 'supprimer', 'livre', 'deleteLivre', 'charger', 'ce livre', 
  { old: 'onClick={() => supprimer(livre.idLivre)}', new: 'onClick={() => setDeleteModal({ isOpen: true, item: livre, impact: [], message: \"Voulez-vous vraiment supprimer ce livre ?\" })}' }
);
