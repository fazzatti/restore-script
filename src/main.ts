import { loadEntries, processLedgerEntries } from "./stellar/process.ts";
import { loadKeysFromCsv } from "./io/readFile.ts";
import { writeEntriesToCsv } from "./io/writeFile.ts";

const args = Deno.args;
const executeRestore = args[0] || false;

console.log(executeRestore ? "Executing restore..." : "Checking keys...");

const entries = await loadKeysFromCsv();
await loadEntries(entries, !executeRestore);

if (executeRestore) {
  console.log("Processing ledger entries...");
  await processLedgerEntries(entries);
}

await writeEntriesToCsv(entries);
