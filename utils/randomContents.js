const fs = require("fs");
const path = require("path");
const readline = require("readline");

let randomResponses = [];

const load = () => {
  return new Promise((resolve, reject) => {
    const rootDir = path.resolve(__dirname, "../");
    const filePath = process.env.MOCK_FILE_PATH || "";
    const separator = process.env.MOCK_FILE_SEPARATOR || "\n";

    if (filePath === "") {
      randomResponses = [
        "This is a random response 1.",
        "This is a random response 2.",
        "This is a random response 3.",
      ];
      resolve();
    } else {
      const fpath = path.join(rootDir, filePath);
      const fileStream = fs.createReadStream(fpath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let currentLine = "";
      rl.on("line", (line) => {
        if (line.trim() === separator) {
          randomResponses.push(currentLine);
          currentLine = "";
        } else {
          currentLine += line + "\n\n";
        }
      });

      rl.on("close", () => {
        if (currentLine !== "") {
          randomResponses.push(currentLine);
        }
        resolve();
      });

      rl.on("error", (err) => {
        reject(err);
      });
    }
  });
};

const getRandomContents = () => randomResponses;

module.exports = {
  load,
  getRandomContents: getRandomContents,
};
