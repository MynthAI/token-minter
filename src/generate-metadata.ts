import config from "config";
import { register } from "metadata";

type Token = {
  assetName: string;
  decimals: number;
  description: string;
  logo: string;
  name: string | undefined;
  policyId: string;
  url: string;
};

const generateMetadata = async () => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    ownerKey: config.get<string>("wallets.owner"),
  };
  const tokens = config.get<Record<string, Token>>("tokens");

  for (const ticker in tokens) {
    const token = tokens[ticker];
    await register({
      ...params,
      token: {
        assetName: token.assetName,
        decimals: token.decimals,
        description: token.description,
        logo: token.logo,
        name: token.name || token.assetName,
        policyId: token.policyId,
        ticker: ticker,
        url: token.url,
      },
    });
  }
};

generateMetadata();
