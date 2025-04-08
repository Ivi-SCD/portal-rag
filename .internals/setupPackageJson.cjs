const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const { deleteFile } = require("./setupUtils.cjs");

const cleanPackageJson = () => {
  const packageJson = require(path.resolve(rootPath, "package.json"));

  delete packageJson.scripts["setup"];
  delete packageJson.scripts["setup:reset"];

  fs.writeFileSync(
    path.resolve(rootPath, "package.json"),
    JSON.stringify(packageJson, null, 2),
    "utf8"
  );

  deleteFile(`${rootPath}/.internals/setup.js`);
}

module.exports = {
  cleanPackageJson,
};
