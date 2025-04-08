const { stdout: output } = require("process");
const { askQuestion, updateJsonFile } = require("./setupUtils.cjs");
const { cleanPackageJson } = require("./setupPackageJson.cjs");
const { askModuleFederationConfigs } = require("./setupModuleFederation.cjs");
const { setupInfra } = require("./setupInfra.cjs");
const { cleanGitIgnore } = require("./setupGitIgnore.cjs");
const { setupObservability } = require("./setupObservability.cjs");
const { setupDocs } = require("./setupDocs.cjs");
const { setupEnvironments } = require('./setupEnvironments.cjs');

const runActions = async () => {
  output.write("🥁 Atualizando arquivos de environments (./public/environment/env[*].js)...");
  await setupEnvironments();
  output.write("\n");

  await setupInfra();
  await askModuleFederationConfigs();

  output.write("📦 Atualizando arquivo package.json (./package.json)...");
  output.write("\n");

  output.write("📦 Atualizando arquivo de Constants (./src/constants.ts)...");
  output.write("\n");

  output.write("🔭 Configurando Observabilidade (./index.html)...");
  await setupObservability();
  output.write("\n");

  output.write(`📗 Preparando documentacao (./README.md)...`);
  await setupDocs();
  output.write("\n");

  output.write("🧹 Limpando package.json...");
  cleanPackageJson();
  output.write("\n");

  output.write("🧹 Limpando .gitignore...");
  cleanGitIgnore();
  output.write("\n");

  output.write("✅ Setup finalizado!");
  output.write("\n");
  output.write("🕗 Aguarde o término da instalação de dependências...");
  output.write("\n");
  process.exit(0);
};

runActions();
