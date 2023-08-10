import config from "config";
import { mint } from "mint";

type Token = {
  name: string;
  supply: bigint;
};

type Tokens = {
  [ticker: string]: Token;
};

const run = async () => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    minterSeed: config.get<string>("wallets.minter"),
    ownerKey: config.get<string>("wallets.owner"),
    tokens: [],
  };
  const shouldMint = process.env.MINT === "true";

  const tokens = [];
  for (const ticker in config.get<Tokens>("tokens")) {
    const token = config.get<Tokens>("tokens")[ticker];
    tokens.push({ name: token.name, amount: token.supply });
  }

  await mint(params, !shouldMint);
};

run();
