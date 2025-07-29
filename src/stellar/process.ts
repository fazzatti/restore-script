import { extendTtl, restore } from "../stellar/transactions.ts";

import { Entry, EntryStatus } from "../entry/entry.ts";
import { config } from "../config/config.ts";

export const processLedgerEntries = async (entries: Entry[]) => {
  for (const entry of entries) {
    if (entry.getStatus() === EntryStatus.Archived) {
      const resultRestore = await restore({
        keys: [entry.getKey()],
      });

      console.log("Restore operation completed successfully:", resultRestore);

      await entry.updateStatus();
    }

    if (entry.getStatus() === EntryStatus.PendingExtend) {
      const resultExtend = await extendTtl({
        keys: [entry.getKey()],
        extendTo: config.extendTtlBy,
      });

      console.log("Extend TTL operation completed successfully:", resultExtend);

      await entry.updateStatus();
    }
  }
};
export const loadEntries = async (entries: Entry[], log: boolean = false) => {
  for (const entry of entries) {
    const status = await entry.updateStatus();

    if (log) {
      console.log(`Entry ${entry.getKey().toXDR("base64")} status: ${status}`);
    }
  }
};
