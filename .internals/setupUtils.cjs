const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const readline = require("readline");
const { stdin: input, stdout: output } = require('process');
const { spawnSync } = require("child_process");

let readlineInterface = readline.createInterface({
  input,
  output
});

const copyFiles = async (pathOrigin, pathDest) => {
  fs.copyFileSync(pathOrigin, pathDest);
}

const copyFolder = async (src, dest) => {
  try {
    // Verifica se o destino existe, se nao, cria o diretorio
    fs.mkdirSync(dest, { recursive: true });

    // Le o conteudo do diretorio de origem
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Se for um diretorio, faz uma chamada recursiva
        await copyFolder(srcPath, destPath);
      } else {
        // Se for um arquivo, copia o arquivo
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error('Erro ao copiar diretorio:', err);
  }
}

const  deleteFile = async (pathFile) => {
  fs.unlinkSync(pathFile);
}

const appendFileContent = ({ destinyFile, textLines }) => {
  const filePath = path.resolve(rootPath, destinyFile);
  let fileContent = fs.readFileSync(filePath, "utf8");
  
  textLines.forEach((text) => {
    fileContent += `\n${text}`;
  });

  fs.writeFileSync(filePath, fileContent, "utf8");
}

const updateJsonFile = ({ attr, filePath = [".", "package.json"], value }) => {
  const packageJson = require(path.resolve(rootPath, ...filePath));
  packageJson[attr] = value;

  fs.writeFileSync(
    path.resolve(rootPath, ...filePath),
    JSON.stringify(packageJson, null, 2),
    "utf8"
  );
}

const showQuestion = (question, choices, currentIndex) => {
  if (!question) {
    readlineInterface = readline.createInterface({
      input,
      output
    });
    return;
  }
  console.clear();
  
  output.write(question);
  output.write("\n");

  choices.forEach((choice, index) => {
    if (index === currentIndex) {
      output.write(`\x1b[33m ▶️ ${choice} \x1b[0m`);
    } else {
      output.write(`   ${choice}`);
    }
    output.write("\n");
  });
}

const askQuestion = async (question, choices) => {
  if (!choices) {
    return new Promise((resolve) => {
      readlineInterface.question(`${question}`, (input) => resolve(input));
    });
  }

  return new Promise((resolve) => {
    let currentIndex = 0;

    showQuestion(`${question}`, choices, currentIndex);

    input.on('keypress', (char, key) => {
      if (key.name === 'up') {
        currentIndex = (currentIndex - 1 + choices.length) % choices.length;
      } else if (key.name === 'down') {
        currentIndex = (currentIndex + 1) % choices.length;
      } else if (key.name === 'return') {
        readlineInterface.close();
        resolve(choices[currentIndex]);
        choices = false;
        question = false;
      }
      console.clear();
      showQuestion(question, choices, currentIndex);
    });

    readlineInterface.on('close', () => {
      console.log('>>> removing listeners')
      input.removeAllListeners('keypress');
    });
  });
}

const installPackage = (lib) => {
  const { platform } = process;
  output.write(`📦 Instalando lib ${lib} (./package.json)...`);
  const result = spawnSync(platform === "win32" ? "pnpm.cmd" : "pnpm", ["install", lib]);
  
  if (result.error) {
    output.write(`🛑 Erro ao executar o comando: ${result.error.message}`);
  }
  output.write("\n");
}

module.exports = {
  appendFileContent,
  askQuestion,
  copyFiles,
  copyFolder,
  deleteFile,
  installPackage,
  updateJsonFile
}

