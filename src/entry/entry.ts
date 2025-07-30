import { xdr } from "stellar-sdk";
import { config, rpc } from "../config/config.ts";

export enum EntryStatus {
  Unverified = "unverified",
  Archived = "archived",
  PendingExtend = "pending_extend",

  ExtensionCompleted = "extension_completed",
}

export class Entry {
  private key: xdr.LedgerKey;
  private status: EntryStatus;
  constructor(keyXdr: string) {
    try {
      this.key = xdr.LedgerKey.fromXDR(keyXdr, "base64");
    } catch (error) {
      console.log(
        `Failed to parse LedgerKey from XDR[${keyXdr}]: ${xdr.LedgerKeyContractData.fromXDR(
          keyXdr,
          "base64"
        )}`
      );

      this.key = xdr.LedgerKey.contractData(
        xdr.LedgerKeyContractData.fromXDR(keyXdr, "base64")
      );
      console.log(`Using fallback LedgerKey: ${this.key.toXDR("base64")}`);
    }
    try {
      this.status = EntryStatus.Unverified;
    } catch (error) {
      throw new Error(
        `Failed to parse LedgerKey from XDR[${keyXdr}]: ${error}`
      );
    }
    try {
      this.status = EntryStatus.Unverified;
    } catch (error) {
      throw new Error(
        `Failed to parse LedgerKey from XDR[${keyXdr}]: ${error}`
      );
    }
  }

  public getKey(): xdr.LedgerKey {
    return this.key;
  }

  public getStatus(): EntryStatus {
    return this.status;
  }

  public async updateStatus(): Promise<EntryStatus> {
    const ledgerEntry = await rpc.getLedgerEntries(this.key);

    const isEntrySuccessfullyFetched =
      ledgerEntry.entries.length > 0 &&
      ledgerEntry.entries[0] &&
      ledgerEntry.entries[0].liveUntilLedgerSeq !== undefined;

    if (!isEntrySuccessfullyFetched) {
      throw new Error(
        `Ledger entry not found for key: ${this.key.toXDR("base64")}`
      );
    }

    const isEntryArchived =
      ledgerEntry.entries[0].liveUntilLedgerSeq === 0 ||
      (ledgerEntry.entries[0].liveUntilLedgerSeq &&
        ledgerEntry.entries[0].liveUntilLedgerSeq <
          Number(config.latestLedger));

    if (isEntryArchived) {
      this.status = EntryStatus.Archived;
      return this.status;
    }

    const isEntryTtlUnderThreshold =
      !isEntryArchived &&
      ledgerEntry.entries[0].liveUntilLedgerSeq &&
      ledgerEntry.entries[0].liveUntilLedgerSeq <
        Number(config.ttlThresholdLedgerSeq);

    if (isEntryTtlUnderThreshold) {
      this.status = EntryStatus.PendingExtend;
      return this.status;
    }

    this.status = EntryStatus.ExtensionCompleted;
    return this.status;
  }
}
