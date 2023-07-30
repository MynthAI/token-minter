import config from "config";
import { mint } from "mint";

const run = async () => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    minterSeed: config.get<string>("wallets.minter"),
    token: {
      name: config.get<string>("token.name"),
      amount: config.get<bigint>("token.supply"),
    },
  };

  await mint(params);
};

run();
