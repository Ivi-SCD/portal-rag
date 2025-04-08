const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const { stdout: output } = require("process");
const { copyFiles, copyFolder, updateJsonFile } = require("./setupUtils.cjs");

const setupDocs = async () => {
  const fileTplPath = [".internals", "templates", "docs"];
  const fileName = "README.md";

  const docsTemplateSource = path.resolve(rootPath, ...fileTplPath, fileName);
  const docsDestinyPath = path.resolve(rootPath, ".", "README.md");
  copyFiles(docsTemplateSource, docsDestinyPath);

  // Remove arquivos de CONTRIBUTING e DEVELOPER
  fs.unlink("./CONTRIBUTING.md", (err) => {
    if (err) {
      output.write(`🛑 Erro ao executar o comando: ${error}`);
      output.write("\n");
    }
  });
  fs.unlink("./DEVELOPER.md",  (err) => {
    if (err) {
      output.write(`🛑 Erro ao executar o comando: ${error}`);
      output.write("\n");
    }
  });
}

module.exports = {
  setupDocs,
}
