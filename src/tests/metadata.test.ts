import util from "util";
import test from "ava";
import config from "config";
import { register } from "../metadata";

test("register function generates valid JSON metadata", async (t) => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    ownerKey:
      "ed25519_sk13644lrp7erfrqu3k5k29kv9stqzudfchxttem5773sef58s9yanspdnhlf",
    token: {
      decimals: 4,
      description: "Just some random test token",
      logo: "mynth-logo.png",
      name: "Unequal Feeding",
      policyId: "0b452d6179d71149afbc475a50c32ccac45e9eea52e21d2fa6ea9592",
      ticker: "UEF",
      url: "https://mynth.ai",
    },
  };

  await register(params);
  t.pass();
});
