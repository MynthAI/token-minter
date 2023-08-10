import config from "config";
import { mint } from "mint";

type Token = {
  name: string;
  supply: bigint;
};

const run = async () => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    minterSeed: config.get<string>("wallets.minter"),
    ownerKey: config.get<string>("wallets.owner"),
    tokens: [],
  };
  const shouldMint = process.env.MINT === "true";

  const tokens = Object.values(config.get<Record<string, Token>>("tokens")).map(
    (token) => ({
      name: token.name,
      amount: token.supply,
    })
  );

  await mint(params, !shouldMint);
};

run();
