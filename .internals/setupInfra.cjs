const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const { setupAwsWebMeta, setupDocker } = require("./setupCI.cjs");
const { askQuestion, copyFiles, copyFolder, installPackage, updateJsonFile } = require("./setupUtils.cjs");
const { updateConstantsBaseName  } = require('./setupConstants.cjs');

const setupAuth = (mode) => {
  let modePath;

  switch(mode.toLowerCase()) {
    case 'cas':
      installPackage('@axa-fr/react-oidc');
      modePath = [".internals", "templates", "auth", "cas"];
    break;
    case 'crm':
      installPackage('@sicredi/authentication');
      modePath = [".internals", "templates", "auth", "aws", "crm"] ;
    break;
    case 'internal':
      installPackage('@sicredi/authentication');
      installPackage('@sicredi/header-navigation-portal');
      modePath = [".internals", "templates", "auth", "aws", "internal"];
    break;
  }

  const appTemplateSource = path.resolve(rootPath, ...modePath, "App.tsx");
  const appDestinyPath = path.resolve(rootPath, "src", "App.tsx");
  const mainTemplateSource = path.resolve(rootPath, ...modePath, "main.tsx");
  const mainDestinyPath = path.resolve(rootPath, "src", "main.tsx");
  copyFiles(appTemplateSource, appDestinyPath);
  copyFiles(mainTemplateSource, mainDestinyPath);
}

const setupInfra = async () => {
  const infraOptions = ['CAS', 'AWS'];
  const context = '[Infraestrutura]';
  const infra = await askQuestion(`⚙️ ${context} Qual infra a aplicação será hospedada?`, infraOptions);

  if (infra === 'CAS') {
    setupAuth(infra);
    setupDocker();
    const srcDir = path.join(rootPath, ".internals", "templates", "ci", "docker");
    const destDir = path.join(rootPath, '.', 'docker');
    copyFolder(srcDir, destDir);
    await updateConstantsBaseName("/");
  } else {
    // caso seja AWS
    const awsModesOptions = ["crm", "internal"];
    const mode = await askQuestion(`⚙️ ${context} Qual o ambiente AWS?`, awsModesOptions);
    setupAuth(mode);

    console.clear();
    let projectPath = '';
    const valitePathPattern = /^(?!\/)[a-z0-9_-]+$/g;
    while(!valitePathPattern.test(projectPath)) {
      projectPath = await askQuestion("⚙️ Digite o path amigável da sua aplicação: (Ex.: minha-app): ");
      console.clear();
    }
    projectPath = mode === "internal" ? `/admin/${projectPath}` : `/${projectPath}`;

    await setupAwsWebMeta({
      projectType: mode,
      projectPath
    });

    await updateJsonFile({
      attr: "homepage",
      value: projectPath
    })

    await updateConstantsBaseName(projectPath);
  }
};

module.exports = {
  setupInfra,
};
