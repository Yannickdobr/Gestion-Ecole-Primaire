const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.controller.ts')) { 
      results.push(file);
    }
  });
  return results;
}
const files = walk('src');
for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  if (!content.includes('Query,')) {
    content = content.replace('Param,', 'Param, Query,');
  }

  const regex = /(remove[A-Za-z]+)\(\s*@Param\([^)]+\)\s*([a-zA-Z]+)\s*:\s*number\s*\)\s*\{\s*return\s+(this\.[a-zA-Z0-9_]+\.\1)\(\2\);\s*\}/g;
  
  content = content.replace(regex, (match, methodName, paramName, serviceCall) => {
    return methodName + "(@Param('id', ParseIntPipe) " + paramName + ": number, @Query('force') force?: string) { return " + serviceCall + "(" + paramName + ", force === 'true'); }";
  });
  
  const regex2 = /(remove[A-Za-z]+)\(\s*@Param\([^)]+\)\s*([a-zA-Z]+)\s*:\s*number\s*\)\s*\{\n\s*return\s+(this\.[a-zA-Z0-9_]+\.\1)\(\2\);\n\s*\}/g;
  
  content = content.replace(regex2, (match, methodName, paramName, serviceCall) => {
    return methodName + "(@Param('id', ParseIntPipe) " + paramName + ": number, @Query('force') force?: string) {\n    return " + serviceCall + "(" + paramName + ", force === 'true');\n  }";
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
}
