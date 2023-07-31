import { spawn } from "child_process";
import { generatePrivateKey } from "lucid-cardano";

const key = generatePrivateKey();
const vaultCli = spawn("vault-cli", [
  "set",
  "token-minter/wallets",
  `owner=${key}`,
]);

vaultCli.on("exit", (code) => {
  if (code) {
    process.exit(code);
  }
});
