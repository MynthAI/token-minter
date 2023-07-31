import util from "util";
import test from "ava";
import config from "config";
import { register } from "../metadata";

test("register function generates valid JSON metadata", async (t) => {
  const params = {
    blockfrostApiKey: config.get<string>("blockfrost"),
    ownerKey:
      "ed25519_sk1kla9j97tjzyjgc557kelaa2zzp7j04404395kruarax7lnk9ma3qvxnj6j",
    token: {
      decimals: 4,
      description: "Just some random test token",
      logo: "mynth-logo.png",
      name: "Feasible Modulation",
      policyId: "b65838793fd0e2b9416baa45defab2813c2653bd1ad8c2b0e30a2d88",
      ticker: "FMT",
      url: "https://mynth.ai",
    },
  };

  await register(params);
  t.pass();
});
