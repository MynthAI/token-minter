import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import util from "util";
import test from "ava";
import config from "config";
import { register } from "../metadata";

const __dirname = dirname(fileURLToPath(import.meta.url));
const readFile = util.promisify(fs.readFile);

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
  let filePath = path.join(
    __dirname,
    "assets/b65838793fd0e2b9416baa45defab2813c2653bd1ad8c2b0e30a2d884665617369626c65204d6f64756c6174696f6e.json"
  );
  const expectedContents = await readFile(filePath, "utf-8");
  filePath = path.join(
    __dirname,
    "../../b65838793fd0e2b9416baa45defab2813c2653bd1ad8c2b0e30a2d884665617369626c65204d6f64756c6174696f6e.json"
  );
  const actualContents = await readFile(filePath, "utf-8");
  t.is(expectedContents, actualContents);
  await fs.promises.unlink(filePath);
});
