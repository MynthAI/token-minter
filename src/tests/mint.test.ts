import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import test from "ava";
import config from "config";
import { generateUsername } from "unique-username-generator";
import { mint } from "../mint";

const randomSleep = async () => {
  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Generate a random number between 10 and 30 seconds
  const randomTime = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
  await sleep(randomTime);
};

const getAsset = async (
  blockfrostApiKey: string,
  policyId: string,
  name: string
) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostApiKey,
  });
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
    token: {
      name: generateUsername(),
      amount: BigInt(Math.random().toString().slice(2)),
    },
  };

  t.timeout(120000);
  const policyId = await mint(params);

  const token = await getAsset(
    params.blockfrostApiKey,
    policyId,
    params.token.name
  );
  t.is(BigInt(token.quantity), params.token.amount);
});
