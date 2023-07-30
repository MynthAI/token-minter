import fs from "fs";
import path from "path";
import {
  Blockfrost,
  fromText,
  Lucid,
  NativeScript,
  Network,
} from "lucid-cardano";
import invariant from "tiny-invariant";

const loadLucid = async (seed: string, blockfrostApiKey: string) => {
  const network = blockfrostApiKey.substring(0, 7);
  invariant(network);
  const lucid = await Lucid.new(
    new Blockfrost(
      `https://cardano-${network}.blockfrost.io/api/v0`,
      blockfrostApiKey
    ),
    (network.charAt(0).toUpperCase() + network.slice(1)) as Network
  );

  lucid.selectWalletFromSeed(seed);
  return lucid;
};

const getKeyHash = (lucid: Lucid, address: string) => {
  const { paymentCredential } = lucid.utils.getAddressDetails(address);
  invariant(paymentCredential);
  return paymentCredential.hash;
};

const loadMintingPolicy = () => {
  const filePath = path.join(__dirname, "..", "minting-policy.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const jsonData: NativeScript = JSON.parse(rawData);

  return jsonData;
};

interface Config {
  blockfrostApiKey: string;
  minterSeed: string;
  token: {
    name: string;
    amount: bigint;
  };
}

const mint = async (config: Config) => {
  console.log("Loading minter wallet");
  const minter = await loadLucid(config.minterSeed, config.blockfrostApiKey);
  const [address, utxos] = await Promise.all([
    minter.wallet.address(),
    minter.wallet.getUtxos(),
  ]);

  invariant(utxos.length, `${address} needs to be funded`);

  console.debug("Creating minting policy");
  const mintingPolicy = loadMintingPolicy();
  invariant(mintingPolicy.scripts, "Minting policy is invalid");
  const minterHash = getKeyHash(minter, address);
  const expiration = minter.utils.unixTimeToSlot(Date.now() + 60);
  mintingPolicy.scripts[0].slot = expiration;
  mintingPolicy.scripts[1].keyHash = minterHash;
  const script = minter.utils.nativeScriptFromJson(mintingPolicy);
  const policyId = minter.utils.mintingPolicyToId(script);
  const unit = policyId + fromText(config.token.name);

  const tx = await minter
    .newTx()
    .mintAssets({ [unit]: config.token.amount })
    .validTo(Date.now() + 200000)
    .attachMintingPolicy(script)
    .complete();

  const signedTx = await tx.sign().complete();
  await signedTx.submit();
};
