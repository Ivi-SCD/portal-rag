const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const constantsPathDest = path.resolve(rootPath, "src", "constants.ts");

const updateConstantsBaseName = async (baseName) => {
  try {
    let constantsFile = fs.readFileSync(constantsPathDest, "utf8");

    constantsFile = constantsFile.replace(
      /@@BASE_NAME@@/g,
      baseName.replace(/^\//, '')
    );

    fs.writeFileSync(constantsPathDest, constantsFile, "utf8");
  } catch (error) {
    // Silencing the error. Use project's Constants "as is"
  }
};

module.exports = {
  updateConstantsBaseName,
};
