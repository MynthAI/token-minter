import { spawn } from "child_process";
import { parse } from "yaml";

let childProcess;

const run = () => {
  const command = "vault-cli";
  const args = ["template", "config/local.yml.j2"];

  const vaultProcess = spawn(command, args);

  vaultProcess.stdout.on("data", (data) => {
    process.env.NODE_CONFIG = JSON.stringify(parse(data.toString()));
    if (process.argv.includes("--test")) {
      runTests();
    } else {
      runIndex();
    }
  });
  vaultProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });
  vaultProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`vault-cli process exited with code ${code}`);
    }
  });

  process.on("exit", shutdown);
  process.on("SIGINT", shutdown);
};

const runIndex = () => {
  const command = "node";
  const args = ["--loader=tsx", "./src/index.ts"];

  childProcess = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform == "win32",
  });
};

const runTests = () => {
  const command = "npx";
  const args = ["ava"];

  childProcess = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform == "win32",
  });
};

async function shutdown(code) {
  if (childProcess) {
    await new Promise((resolve) => {
      childProcess.on("close", resolve);
      childProcess.kill("SIGINT");
      childProcess = null;
      console.log();
    });
  }

  process.exit(code);
}

run();
