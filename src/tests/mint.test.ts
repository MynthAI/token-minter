import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import test from "ava";
import config from "config";
import { generatePrivateKey } from "lucid-cardano";
import { generateUsername } from "unique-username-generator";
import { getKeyHash, loadLucid, mint } from "../mint";

const randomSleep = async () => {
  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Generate a random number between 10 and 30 seconds
  const randomTime = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
  await sleep(randomTime);
};

const getAsset = async (
  blockfrost: BlockFrostAPI,
  policyId: string,
  name: string
) => {
  const assetId = policyId + Buffer.from(name).toString("hex");
  while (true) {
    try {
      return await blockfrost.assetsById(assetId);
    } catch {
      await randomSleep();
    }
  }
};

test("successfully mints a token", async (t) => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    minterSeed: config.get<string>("wallets.minter"),
    ownerKey: generatePrivateKey(),
    tokens: [
      {
        name: generateUsername(),
        amount: BigInt(Math.random().toString().slice(2)),
      },
    ],
  };

  t.timeout(120000);
  const policyId = await mint(params, false);

  const blockfrost = new BlockFrostAPI({
    projectId: params.blockfrostApiKey,
  });
  const token = await getAsset(blockfrost, policyId, params.tokens[0].name);
  t.is(BigInt(token.quantity), params.tokens[0].amount);

  const policyScript = await blockfrost.scriptsJson(policyId);
  if (
    !Array.isArray(policyScript.json.scripts) ||
    policyScript.json.scripts.length <= 1
  ) {
    t.fail("Invalid policy ID");
    return;
  }
  const keyHash = policyScript.json.scripts[1].keyHash;
  const owner = await loadLucid(params.ownerKey, params.blockfrostApiKey);
  const ownerAddress = await owner.wallet.address();
  t.is(keyHash, getKeyHash(ownerAddress));
});
