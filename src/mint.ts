import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import {
  Blockfrost,
  fromText,
  Lucid,
  NativeScript,
  Network,
} from "lucid-cardano";
import invariant from "tiny-invariant";

const __dirname = dirname(fileURLToPath(import.meta.url));

const expiresIn = 200000; // About 3 minutes

const loadLucid = async (wallet: string, blockfrostApiKey: string) => {
  const network = blockfrostApiKey.substring(0, 7);
  invariant(network);
  const lucid = await Lucid.new(
    new Blockfrost(
      `https://cardano-${network}.blockfrost.io/api/v0`,
      blockfrostApiKey
    ),
    (network.charAt(0).toUpperCase() + network.slice(1)) as Network
  );

  if (wallet.includes(" ")) {
    lucid.selectWalletFromSeed(wallet);
  } else {
    lucid.selectWalletFromPrivateKey(wallet);
  }
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

const mint = async (config: Config, dryrun: boolean = true) => {
  console.log("Loading wallets");
  const minter = await loadLucid(config.minterSeed, config.blockfrostApiKey);
  const ownerKey = minter.utils.generatePrivateKey();
  const owner = await loadLucid(ownerKey, config.blockfrostApiKey);

  const [address, utxos] = await Promise.all([
    owner.wallet.address(),
    minter.wallet.getUtxos(),
  ]);

  invariant(utxos.length, `${address} needs to be funded`);

  console.debug("Creating minting policy");
  const mintingPolicy = loadMintingPolicy();
  invariant(mintingPolicy.scripts, "Minting policy is invalid");
  const ownerHash = getKeyHash(owner, address);
  const expiration = minter.utils.unixTimeToSlot(Date.now() + expiresIn);
  mintingPolicy.scripts[0].slot = expiration;
  mintingPolicy.scripts[1].keyHash = ownerHash;
  const script = minter.utils.nativeScriptFromJson(mintingPolicy);
  const policyId = minter.utils.mintingPolicyToId(script);
  const unit = policyId + fromText(config.token.name);

  console.debug("Building transaction");
  const tx = await minter
    .newTx()
    .mintAssets({ [unit]: config.token.amount })
    .validTo(Date.now() + expiresIn)
    .addSignerKey(ownerHash)
    .attachMintingPolicy(script)
    .complete();

  const signedTx = await tx.signWithPrivateKey(ownerKey).sign().complete();

  if (dryrun === false) await signedTx.submit();

  console.debug("Minted token with policy ID", policyId);
  return policyId;
};

export { mint };
