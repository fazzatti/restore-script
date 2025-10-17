// https://api.stellar.expert/explorer/public/contract-data/CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75?order=desc&limit=200

import { Entry } from "./entry/entry.ts";
import { fetchEntries } from "./expert-api/index.ts";
import { parseLedgerKey } from "./io/readFile.ts";
import { writeEntriesToCsv } from "./io/writeFile.ts";
import { loadEntries, processLedgerEntries } from "./stellar/process.ts";
import { config } from "./config/config.ts";

const args = Deno.args;
const executeRestore = args[0] || false;

const { contractId } = config;
if (!contractId) {
  console.error("CONTRACT_ID is not set in the environment variables.");

  Deno.exit(1);
}

console.log(
  executeRestore
    ? "Executing restore / extend script..."
    : "Checking entries..."
);

const options = {
  delayMs: 500, // 500 milliseconds delay between requests
  limit: 200, // fetch 200 records per request
};

const persistentEntriesRaw = await fetchEntries(contractId, {
  ...options,
  durability: "persistent",
});

const instanceEntriesRaw = await fetchEntries(contractId, {
  ...options,
  durability: "instance",
});

const persistentEntries = await Promise.all(
  persistentEntriesRaw.map(async (e) => {
    const xdrString = await parseLedgerKey({
      key: e.key,
      keyType: "ScValTypeScvVec",
      contractId: contractId,
    });
    return new Entry(xdrString);
  })
);

const instanceEntries = await Promise.all(
  instanceEntriesRaw.map(async (e) => {
    const xdrString = await parseLedgerKey({
      key: e.key,
      keyType: "ScValTypeScvLedgerKeyContractInstance",
      contractId: contractId,
    });
    return new Entry(xdrString);
  })
);

const entries = [...persistentEntries, ...instanceEntries];

console.log("Total Entries:", entries.length);
await loadEntries(entries, true);

if (executeRestore) {
  console.log("Processing ledger entries...");
  await processLedgerEntries(entries);
}

await writeEntriesToCsv(entries);
