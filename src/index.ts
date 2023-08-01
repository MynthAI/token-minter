import config from "config";
import { mint } from "mint";

const run = async () => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    minterSeed: config.get<string>("wallets.minter"),
    ownerKey: config.get<string>("wallets.owner"),
    token: {
      name: config.get<string>("token.name"),
      amount: config.get<bigint>("token.supply"),
    },
  };

  const shouldMint = process.env.MINT === "true";
  await mint(params, !shouldMint);
};

run();
