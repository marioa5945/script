import readline from "readline";
import util from "util";
import tomlJson from "toml-json";
import { resolve } from "path";
import fs from "fs";
const products = fs.readdirSync(resolve(".", "./products"));

interface ifsConfig {
  operators: string[];
  cmds: {
    updateImage: string[];
    cloneList: string[];
    pullList: string[];
    yarnList: string[];
  };
}

const config = <ifsConfig>tomlJson({ fileUrl: "./config.toml" });
const { operators, cmds } = config;
const rl = readline.createInterface(process.stdin, process.stdout);

const exec = util.promisify(require("child_process").exec);

let chooseIndex = 0;

/**
 * Choose to do something
 */
const chooseToDoSomething = () => {
  let str = "\r\nChoose to do something:\r\n";
  for (let i = 0; i < operators.length; i++) {
    str += `${chooseIndex === i ? "[X]" : "[ ]"} ${operators[i]}\r\n`;
  }
  process.stdout.write(str);
};

// Print choose of first
chooseToDoSomething();

process.stdin.on("keypress", (s: unknown, key: any): void => {
  const name = key.name;

  if (name === "up" && chooseIndex > 0) {
    chooseIndex--;
  } else if (name === "down" && chooseIndex < operators.length - 1) {
    chooseIndex++;
  } else if (name === "down" && chooseIndex === operators.length - 1) {
    chooseIndex = 0;
  } else if (name === "up" && chooseIndex === 0) {
    chooseIndex = operators.length - 1;
  } else {
    return;
  }

  // Move the cursor to cover
  readline.moveCursor(process.stdout, 0, -operators.length - 2);

  chooseToDoSomething();
});

rl.on("line", async () => {
  console.log(`${operators[chooseIndex]}, running...\r\n`);
  switch (chooseIndex) {
    case 0: {
      for (const cmd of cmds.updateImage) {
        const { stdout, stderr } = await exec(cmd);
        console.log(stderr);
        if (stderr === "") {
          console.log(stdout);
        } else {
          console.log("exec error: " + stderr);
          break;
        }
      }
      break;
    }
    case 1: {
      for (const cmd of cmds.cloneList) {
        const arr = /\/(.+).git/.exec(cmd);
        if (arr) {
          if (!products.includes(arr[1])) {
            const { stdout, stderr } = await exec(cmd);
            console.log(stderr === "" ? stdout : stderr);
          }
        }
      }
      break;
    }
    case 2: {
      for (const cmd of cmds.pullList) {
        const { stdout, stderr } = await exec(cmd);
        console.log(stderr === "" ? stdout : stderr);
      }
      break;
    }
    case 3: {
      for (const cmd of cmds.yarnList) {
        const { stdout, stderr } = await exec(cmd);
        console.log(stderr === "" ? stdout : stderr);
      }
      break;
    }
    default: {
      //
    }
  }
  console.log("\r\n===================== exit\r\n");
  process.exit(0);
}).on("close", () => {
  rl.close();
});
