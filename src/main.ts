import { xdr } from "stellar-sdk";
import { getContractInstanceLedgerEntry } from "./getContractInstanceLedgerEntries.ts";
import { extendTtl } from "./transaction.ts";

getContractInstanceLedgerEntry();

const usdcTestnetInstanceKey =
  "AAAABgAAAAFQRc1ewHKado/VrQJQWFLfTwKNzoMOWsUiCbpISDsvAQAAABQAAAAB";

const result = await extendTtl({
  keys: [xdr.LedgerKey.fromXDR(usdcTestnetInstanceKey, "base64")],
  extendTo: 2000000,
});

console.log("Extend TTL operation completed successfully:", result);
