const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const { appendFileContent, copyFiles, deleteFile, updateJsonFile } = require("./setupUtils.cjs");
const { spawnSync } = require('child_process');

const uninstallPackage = (lib) => {
  const { platform } = process;
  const result = spawnSync(platform === 'win32'? 'pnpm.cmd' : 'pnpm', ['install', lib]);
      
  if (result.error) {
    process.stdout.write(`🛑 Erro ao executar o comando: ${result.error.message}`);
  } else {
    process.stdout.write(`📦 Removendo lib ${lib} (./package.json)...`);
    console.log(result.stdout.toString());
  }
}

const resetFiles = () => {
  const appTemplateSource = path.resolve(rootPath, ".internals", "templates", "reset", "App.tsx");
  const appDestinyPath = path.resolve(rootPath, "src", "App.tsx");
  const mainTemplateSource = path.resolve(rootPath, ".internals", "templates", "reset", "main.tsx");
  const mainDestinyPath = path.resolve(rootPath, "src", "main.tsx");
  copyFiles(appTemplateSource, appDestinyPath);
  copyFiles(mainTemplateSource, mainDestinyPath);
}

const resetInfra = async () => {

  // resetAuth
  uninstallPackage("@axa-fr/react-oidc");
  uninstallPackage("@sicredi/authentication");
  uninstallPackage("@sicredi/header-navigation-portal");

  // resetModuleFederation (nao tá removendo as conf. do vite!)
  uninstallPackage("@originjs/vite-plugin-federation");

  // Reseta o .gitignore
  appendFileContent({
    destinyFile: ".gitignore", 
    textLines: [
      "moduleFederationHost.config.ts",
      "moduleFederationRemote.config.ts",
      "aws-web-meta.json"
    ]
  });

  // Reseta o package.json
  await updateJsonFile({
    attr: "homepage",
    value: "."
  });
  await updateJsonFile({
    attr: "name",
    value: "canais-chatbot-rag-front"
  });

  // Remove aqrquivos de configuração do module federation
  deleteFile(`${rootPath}/moduleFederationHost.config.ts`);
  deleteFile(`${rootPath}/moduleFederationRemote.config.ts`);

  // Remove docker file
  deleteFile(`${rootPath}/Dockerfile`);

  // Remove aws-web-meta.json
  deleteFile(`${rootPath}/aws-web-meta.json`);

  resetFiles();

  process.exit(0);
}

resetInfra();
