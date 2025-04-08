const fs = require("fs");
const path = require("path");
const { askQuestion } = require("./setupUtils.cjs");
const { stdout: output } = require("process");
const rootPath = path.resolve(__dirname, "..");

const setupEnvironments = async () => {
  const pattern = new RegExp('^(https?:\\/\\/)' + // protocolo (http ou https)
    '((([a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9])|(([a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9]\\.)+[a-zA-Z]{2,})))' + // domínio
    '(\\:\\d{2,5})?' + // porta
    '(\\/[-a-zA-Z0-9%_.~+]*)*' + // caminho
    '(\\?[;&a-zA-Z0-9%_.~+=-]*)?' + // query string
    '(\\#[-a-zA-Z0-9_]*)?$', 'i'); // fragmento

  let bffURL = '';
  while (!pattern.test(bffURL)) {
    bffURL = await askQuestion("⚙️ Digite a URL do BFF (Ex.: http://localhost:8080/path-do-bff): ");
  }

  const fileTplPath = [".internals", "templates", "environment"];
  const fileName = "env.js";
  const templateSource = path.resolve(rootPath, ...fileTplPath, fileName);

  let templateFile = fs.readFileSync(templateSource, "utf8");

  templateFile = templateFile.replace(
    /@@BFF_URL@@/g,
    bffURL.replace(/^\//, '').toLowerCase()
  );

  const filePathDest = ["public", "environment"];
  const envFolder = path.resolve(rootPath, ...filePathDest);
  try {
    if (!fs.existsSync(envFolder)) {
      fs.mkdirSync(envFolder);
    }
  } catch (error) {
    output.write(`🛑 Erro ao executar o comando: ${error}`);
    output.write("\n");
  }

  // Cria um arquivo por environment
  const envSufix = ["", ".dev", ".uat", ".stress", ".prod"];
  envSufix.map((env) => {
    fs.writeFileSync(path.resolve(rootPath, ...filePathDest, `env${env}.js`), templateFile, "utf8");
  })
}

module.exports = {
  setupEnvironments,
}
