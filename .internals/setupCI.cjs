const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const { stdout: output } = require("process");
const { copyFiles, copyFolder, updateJsonFile } = require("./setupUtils.cjs");

const setupAwsWebMeta = async ({ projectType, projectPath }) => {
  // Realiza a copia do arquivo de template
  const fileTplPath = [".internals", "templates", "ci"];

  //Em formato TXT devido a issue no DevConsole que nao copia o arquivo .json
  const fileName = "aws-web-meta.txt";

  output.write(`📦 Criando arquivo de configuração (./${fileName})...`);
  
  const webMetaTemplateSource = path.resolve(rootPath, ...fileTplPath, fileName);
  const webMetaDestinyPath = path.resolve(rootPath, ".", "aws-web-meta.json");
  copyFiles(webMetaTemplateSource, webMetaDestinyPath);

  // Realiza o parse de substituicao
  const filePath = [".", "aws-web-meta.json"];
  await updateJsonFile({
    attr: "job_template_type",
    value: [`${projectType.toLowerCase()}`],
    filePath
  })

  const baseHref = `{ "${projectType.toLowerCase()}" : "${projectPath.toLowerCase()}" }`;

  await updateJsonFile({
    attr: "base_href",
    value: JSON.parse(baseHref),
    filePath
  });
}

const copyDockerFolder = async () => {
  const srcDir = path.resolve(rootPath, ".internals", "templates", "ci", "docker");
  const destDir = path.resolve(rootPath, ".", "docker");

  output.write(`📦 Criando arquivo de configuração para o NGINX...`);
  await copyFolder(srcDir, destDir)
}

const setupDocker = async () => {
  const filePath = [".internals", "templates", "ci"];
  const fileName = "Dockerfile";
  output.write(`📦 Criando arquivo de configuração (./${fileName})...`);
  const dockerTemplateSource = path.resolve(rootPath, ...filePath, fileName);
  const dockerDestinyPath = path.resolve(rootPath, ".", fileName);
  copyFiles(dockerTemplateSource, dockerDestinyPath);

  await copyDockerFolder();
}

module.exports = {
  copyDockerFolder,
  setupAwsWebMeta,
  setupDocker
}
