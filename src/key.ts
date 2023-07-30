import { bech32 } from "bech32";

const toCborHex = (rawPrivateKey: string) => {
  const decoded = bech32.decode(rawPrivateKey);
  const words = bech32.fromWords(decoded.words);
  const hexStr = words
    .map((word) => word.toString(16).padStart(2, "0"))
    .join("");
  return "5820" + hexStr;
};

export { toCborHex };
