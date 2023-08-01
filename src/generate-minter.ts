import { spawn } from "child_process";
import { generateSeedPhrase } from "lucid-cardano";

const seedPhrase = generateSeedPhrase();
const vaultCli = spawn("vault-cli", [
  "set",
  "token-minter/wallets",
  `minter=${seedPhrase}`,
]);

vaultCli.on("exit", (code) => {
  if (code) {
    process.exit(code);
  }
});
