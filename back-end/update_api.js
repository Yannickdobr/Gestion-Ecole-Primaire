const fs = require('fs');
let file = '../front-end/src/lib/api.js';
let content = fs.readFileSync(file, 'utf8');

// Update apiFetch error throwing
content = content.replace(
  /throw new Error\(msg\);/,
  'const err = new Error(msg); err.status = res.status; err.requireConfirmation = data.requireConfirmation; err.impact = data.impact; throw err;'
);

// We need to also handle the ones that might have different argument names like deletePersonne(idPers)
content = content.replace(
  /export const delete([A-Za-z0-9_]+) = \(([A-Za-z0-9_]+)\) =>\s*apiFetch\(\`([^\`]+)\`,\s*\{\s*method:\s*[\"']DELETE[\"']\s*\}\);/g,
  (match, name, arg, url) => {
    return `export const delete${name} = (${arg}, force = false) =>
  apiFetch(\`${url}\${force ? '?force=true' : ''}\`, { method: 'DELETE' });`;
  }
);

fs.writeFileSync(file, content);
console.log('done');
