const fs = require("fs");
const path = require("path");
const dir = "c:/Users/YANNICK28/Desktop/yannick/Tous mes codes du 3GI/Projet BD/back-end/src/entities";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".entity.ts"));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");
  
  // Replace `type: 'tinyint', width: 1` with `type: 'smallint'`
  content = content.replace(/type: 'tinyint', width: 1/g, "type: 'smallint'");
  
  fs.writeFileSync(filePath, content);
}
console.log("Fixed types for Postgres.");
