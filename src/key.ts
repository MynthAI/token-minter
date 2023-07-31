import { bech32 } from "bech32";

const toCborHex = (rawPrivateKey: string) => {
  const decoded = bech32.decode(rawPrivateKey);
  const words = bech32.fromWords(decoded.words);
  const hexStr = words
    .map((word) => word.toString(16).padStart(2, "0"))
    .join("");
  return "5820" + hexStr;
};

const toSkey = (rawPrivateKey: string) => {
  return (
    JSON.stringify(
      {
        type: "PaymentSigningKeyShelley_ed25519",
        description: "Payment Signing Key",
        cborHex: toCborHex(rawPrivateKey),
      },
      null,
      4
    ) + "\n"
  );
};

export { toCborHex, toSkey };
