import test from "ava";
import config from "config";
import { generateUsername } from "unique-username-generator";
import { mint } from "../mint";

test("successfully mints a token", async (t) => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    minterSeed: config.get<string>("wallets.minter"),
    token: {
      name: generateUsername(),
      amount: BigInt(Math.random().toString().slice(2)),
    },
  };

  const policyId = await mint(params);
  console.debug(policyId);
  t.is(typeof policyId, "string");
});
