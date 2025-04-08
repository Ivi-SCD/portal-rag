const fs = require("fs");
const path = require("path");
const { stdout: output } = require("process");
const rootPath = path.resolve(__dirname, "..");
const { askQuestion, copyFiles } = require("./setupUtils.cjs");

const setupModuleFederation = async ({ type, hostAppName, hostAppUrl }) => {
  try {
    // Cria uma copia do template e faz o replace dos dados
    const mfeSetupPathSource = path.resolve(rootPath, ".internals", "templates", "module_federation", type === 'remote' ? "moduleFederationRemoteSetup.ts" : "moduleFederationHostSetup.ts");
    const mfeSetupPathDest = path.resolve(rootPath, type === 'remote' ? "moduleFederationRemote.config.ts" : "moduleFederationHost.config.ts");
    await copyFiles(mfeSetupPathSource, mfeSetupPathDest);
    
    let mfeSetupFile = fs.readFileSync(mfeSetupPathDest, "utf8");

    if (type !== 'remote') {
      mfeSetupFile = mfeSetupFile.replace(
        /@@HOST_APP@@/g,
        hostAppName
      ).replace(
        /@@HOST_APP_URL@@/g,
        hostAppUrl
      );
    }
    fs.writeFileSync(mfeSetupPathDest, mfeSetupFile, "utf8");

    // Atualiza o arquivo do vite adicionando essa configuração
    await configViteForModuleFederation(type);
  } catch (error) {
    // Silencing the error. Use project's package.json "as is"
    output.write(`🛑 Erro ao executar o comando: ${error}`);
  }
};

const configViteForModuleFederation = async (type) => {
  try {
    const viteConfigPath = path.resolve(rootPath, ".", "vite.config.ts");
    let viteConfigFile = fs.readFileSync(viteConfigPath, "utf8");
    let importString = '';
    if (type === "remote") {
      importString ="import ModuleFederationRemoteSetup from \"./moduleFederationRemote.config\";\n" +
        "// eslint-disable-next-line prefer-const\n" +
        "moduleFederationSetup = ModuleFederationRemoteSetup();"
    } else {
      importString = "import ModuleFederationHostSetup from \"./moduleFederationHost.config\";\n" +
        "// eslint-disable-next-line prefer-const\n" +
        "moduleFederationSetup = ModuleFederationHostSetup();"
    }

    viteConfigFile = viteConfigFile.replace(
      /\/\/ @@MODULE_FEDERATION_REMOTE_SETUP@@/g,
      importString
    );
    fs.writeFileSync(viteConfigPath, viteConfigFile, "utf8");

  } catch (error) {
    // Silencing the error. Use project's Constants "as is"
    output.write(`🛑 Erro ao executar o comando: ${error}`);
  }
}

const askModuleFederationConfigs = async () => {
  const context = '[Module Federation]';
  const confirmOptions = ['Sim', 'Nao'];
  const typeOptions = ['host', 'remote'];

  const enableModuleFederation = await askQuestion(`⚙️ ${context} Deseja habilitar?:`, confirmOptions);

  if (enableModuleFederation === 'Sim') {
    const type = await askQuestion(`⚙️ ${context} Aplicação será Host ou Remote?:`, typeOptions);

    if (type === 'remote') {
      output.write(`📦 ${context} Pré-configurando Vite modo REMOTE (./vite.config.js)...`);
      await setupModuleFederation({
        type
      });
    } else {
      let hostAppName = await askQuestion("⚙️ ${context} Digite o nome da aplicação host: ");
      let hostAppUrl = await askQuestion("⚙️ ${context} Digite a URL da aplicação host: ");
      output.write(`📦 ${context} Pré-configurando Vite modo HOST (./vite.config.js)...`);
      await setupModuleFederation({
        type,
        hostAppName,
        hostAppUrl
      });
    }
    output.write("\n");
  }      
  output.write("\n");
}

module.exports = {
  setupModuleFederation,
  askModuleFederationConfigs
};
