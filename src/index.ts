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
  };
  const tokens = config.get<Tokens>("tokens");
  const shouldMint = process.env.MINT === "true";

  for (const ticker in tokens) {
    const token = tokens[ticker];
    await mint(
      {
        ...params,
        token: {
          name: token.name,
          amount: token.supply,
        },
      },
      !shouldMint
    );
  }
};

run();
