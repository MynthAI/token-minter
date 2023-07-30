import test from "ava";
import { toCborHex } from "../key";

test("convert raw private key to cborHex", (t) => {
  const hex = toCborHex(
    "ed25519_sk1ev8gc0ynzfgls3xdprqlz6uze7sdtptuulmrp6u4rj60w69gxhrqq7lxe5"
  );
  t.is(
    hex,
    "5820cb0e8c3c931251f844cd08c1f16b82cfa0d5857ce7f630eb951cb4f768a835c6"
  );
});

test("convert raw private key to cborHex 2", (t) => {
  const hex = toCborHex(
    "ed25519_sk17k3mzkcyg5ytjhtmlhu689zwj9u6pn0d7u5aykawz5mwkcusjg2sd3g0dd"
  );
  t.is(
    hex,
    "5820f5a3b15b044508b95d7bfdf9a3944e9179a0cdedf729d25bae1536eb63909215"
  );
});
