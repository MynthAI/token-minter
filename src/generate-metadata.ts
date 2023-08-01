import config from "config";
import { register } from "metadata";

const generateMetadata = async () => {
  const configData = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    ownerKey: config.get<string>("wallets.owner"),
    token: {
      decimals: config.get<number>("token.supply"),
      description: config.get<string>("token.description"),
      logo: config.get<string>("token.logo"),
      name: config.get<string>("token.name"),
      policyId: config.get<string>("token.policyId"),
      ticker: config.get<string>("token.ticker"),
      url: config.get<string>("token.url"),
    },
  };

  await register(configData);
};

generateMetadata();