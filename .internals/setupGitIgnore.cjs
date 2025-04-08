const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");

const cleanGitIgnore = () => {
  // Permite manter os arquivos de conf. no projeto pós setup
  const gitIgnorePath = path.resolve(rootPath, ".gitignore");
  let gitIgnoreFile = fs.readFileSync(gitIgnorePath, "utf8");

  gitIgnoreFile = gitIgnoreFile.replace(
    /moduleFederationHost.config.ts/g,
    ''
  ).replace(
    /moduleFederationRemote.config.ts/g,
    ''
  ).replace(
    /aws-web-meta.json/g,
    ''
  );

  fs.writeFileSync(gitIgnorePath, gitIgnoreFile, "utf8");
}

module.exports = {
  cleanGitIgnore
};
