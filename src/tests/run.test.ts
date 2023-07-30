import { spawn } from "child_process";
import util from "util";
import test from "ava";

test("npm run start outputs a policy ID", async (t) => {
  const npmStart = spawn("npm", ["run", "start"]);

  let output = "";
  npmStart.stdout.on("data", (data) => {
    output += data.toString();
  });

  const exitCode = await new Promise((resolve, reject) => {
    npmStart.on("close", (code) => {
      resolve(code);
    });

    npmStart.on("error", (err) => {
      reject(err);
    });
  });
  t.is(exitCode, 0);
  t.true(output.includes("Minted token with policy ID"), output);
});
