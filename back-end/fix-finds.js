const { Project, SyntaxKind } = require("ts-morph");

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.service.ts");

const sourceFiles = project.getSourceFiles();

let changes = 0;

for (const sourceFile of sourceFiles) {
  let fileChanged = false;
  
  // Find all property access expressions like `this.xxxRepository.find` or `findOne`
  const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  for (const call of calls) {
    const expr = call.getExpression();
    if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
      const name = expr.getName();
      if (name === "find" || name === "findOne") {
        const args = call.getArguments();
        
        if (args.length === 0) {
          // .find() => .find({ where: { isDelete: 0 } })
          call.addArgument("{ where: { isDelete: 0 } }");
          fileChanged = true;
          changes++;
        } else if (args.length === 1 && args[0].getKind() === SyntaxKind.ObjectLiteralExpression) {
          const obj = args[0];
          const whereProp = obj.getProperty("where");
          
          if (!whereProp) {
            // .find({ relations: [...] }) => .find({ where: { isDelete: 0 }, relations: [...] })
            obj.insertPropertyAssignment(0, { name: "where", initializer: "{ isDelete: 0 }" });
            fileChanged = true;
            changes++;
          } else {
            // Has where clause
            if (whereProp.getKind() === SyntaxKind.PropertyAssignment) {
              const init = whereProp.getInitializer();
              if (init.getKind() === SyntaxKind.ObjectLiteralExpression) {
                // where: { id: 1 } => where: { id: 1, isDelete: 0 }
                // Avoid adding if already there
                if (!init.getProperty("isDelete")) {
                  init.addPropertyAssignment({ name: "isDelete", initializer: "0" });
                  fileChanged = true;
                  changes++;
                }
              } else if (init.getKind() === SyntaxKind.ArrayLiteralExpression) {
                // where: [{ id: 1 }, { id: 2 }] => where: [{ id: 1, isDelete: 0 }, { id: 2, isDelete: 0 }]
                const elements = init.getElements();
                for (const el of elements) {
                  if (el.getKind() === SyntaxKind.ObjectLiteralExpression) {
                    if (!el.getProperty("isDelete")) {
                      el.addPropertyAssignment({ name: "isDelete", initializer: "0" });
                      fileChanged = true;
                      changes++;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  if (fileChanged) {
    sourceFile.saveSync();
  }
}

console.log("Updated " + changes + " find/findOne queries.");

