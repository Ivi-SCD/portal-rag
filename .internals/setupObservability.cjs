const fs = require("fs");
const path = require("path");
const { stdout: output } = require("process");
const rootPath = path.resolve(__dirname, "..");

const setupObservability = async (projectName) => {
    try {
      const fileTplPath = [".internals", "templates", "observability"];
      const sourceTplFile = path.resolve(rootPath, ...fileTplPath, "observability-script.html");
      const sourceTemplate = fs.readFileSync(sourceTplFile, "utf8");

      const filePath = ["."];
      const sourceFile = path.resolve(rootPath, ...filePath, "index.html");
  
      let indexFile = fs.readFileSync(sourceFile, "utf8");

      indexFile = indexFile.replace(
        /<!--ObservabilityScript-->/g,
        sourceTemplate
      );
      
      fs.writeFileSync(sourceFile, indexFile, "utf8");
    } catch (error) {
      output.write(`🛑 Erro ao executar o comando: ${error}`);
    }

}

module.exports = {
  setupObservability
}
