import { spawn } from "child_process";
import fs from "fs";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";

const spawnPromise = (
  command: string,
  args: ReadonlyArray<string>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args);

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

const savePolicyScript = async (blockfrostApiKey: string, policyId: string) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostApiKey,
  });
  const policyScript = await blockfrost.scriptsJson(policyId);
  await fs.promises.writeFile("policy.script", JSON.stringify(policyScript));
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
  await savePolicyScript(config.blockfrostApiKey, config.token.policyId);
  await spawnPromise("token-metadata-creator", [
    "entry",
    "--init",
    tokenId,
    "--name",
    "Null",
    "--description",
    "Null",
    "--ticker",
    "Null",
    "--url",
    "Null",
    "--logo",
    "n.png",
    "--decimals",
    "Null",
    "--policy",
    "policy.script",
  ]);
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
};
