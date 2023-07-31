import { spawn } from "child_process";
import fs from "fs";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { toSkey } from "key";
import { getKeyHash, loadLucid } from "mint";

const spawnPromise = (
  command: string,
  args: ReadonlyArray<string>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, { stdio: "inherit" });

    childProcess.on("error", (error) => {
      reject(error);
    });

    childProcess.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
};

interface Config {
  blockfrostApiKey: string;
  ownerKey: string;
  token: {
    decimals: number;
    description: string;
    logo: string;
    name: string;
    policyId: string;
    ticker: string;
    url: string;
  };
}

const savePolicyScript = async (
  blockfrostApiKey: string,
  policyId: string,
  ownerKey: string
) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostApiKey,
  });
  const policyScript = await blockfrost.scriptsJson(policyId);

  const owner = await loadLucid(ownerKey, blockfrostApiKey);
  const ownerAddress = await owner.wallet.address();
  const ownerKeyHash = getKeyHash(ownerAddress);

  if (
    !Array.isArray(policyScript.json.scripts) ||
    policyScript.json.scripts.length <= 1
  ) {
    throw new Error("Invalid policy ID");
  }

  if (policyScript.json.scripts[1].keyHash != ownerKeyHash) {
    console.error(
      "Key mismatch:",
      policyScript.json.scripts[1].keyHash,
      ownerKeyHash
    );
    throw new Error("Owner did not create token");
  }

  await fs.promises.writeFile(
    "policy.script",
    JSON.stringify(policyScript.json)
  );
};

const savePolicyKey = async (ownerKey: string) => {
  const skey = toSkey(ownerKey);
  await fs.promises.writeFile("policy.skey", skey);
};

const createMetadata = async (
  token: string,
  name: string,
  description: string,
  ticker: string,
  url: string,
  logo: string,
  decimals: string
) => {
  await spawnPromise("token-metadata-creator", [
    "entry",
    "--init",
    token,
    "--name",
    name,
    "--description",
    description,
    "--ticker",
    ticker,
    "--url",
    url,
    "--logo",
    logo,
    "--decimals",
    decimals,
    "--policy",
    "policy.script",
  ]);
};

const register = async (config: Config) => {
  const tokenId =
    config.token.policyId + Buffer.from(config.token.name).toString("hex");
  await savePolicyScript(
    config.blockfrostApiKey,
    config.token.policyId,
    config.ownerKey
  );
  await spawnPromise("token-metadata-creator", ["entry", "--init", tokenId]);
  await spawnPromise("token-metadata-creator", [
    "entry",
    "--init",
    tokenId,
    "--name",
    config.token.name,
    "--description",
    config.token.description,
    "--ticker",
    config.token.ticker,
    "--url",
    config.token.url,
    "--logo",
    config.token.logo,
    "--decimals",
    Math.floor(config.token.decimals).toString(),
    "--policy",
    "policy.script",
  ]);

  await savePolicyKey(config.ownerKey);
  await spawnPromise("token-metadata-creator", [
    "entry",
    tokenId,
    "-a",
    "policy.skey",
  ]);
};

export { register };
