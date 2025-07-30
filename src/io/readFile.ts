import { Address, Contract, xdr } from "stellar-sdk";
import { Entry } from "../entry/entry.ts";
import { Api } from "stellar-sdk/rpc";
import { rpc } from "../config/config.ts";

export interface CsvEntry {
  contractId: string;
  keyType: string;
  key: string;
}

export const loadRawKeys = async (
  filePath: string = "keys.csv"
): Promise<Entry[]> => {
  try {
    const csvContent = await Deno.readTextFile(filePath);
    const lines = csvContent.trim().split("\n");

    const entries: Entry[] = lines.map((line, index) => {
      try {
        // Remove quotes from the XDR string
        const keyXdr = line.replace(/^"(.*)"$/, "$1").trim();
        return new Entry(keyXdr);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to create Entry for line ${index + 1}: ${errorMessage}`
        );
      }
    });

    console.log(`Loaded ${entries.length} entries from ${filePath}`);
    return entries;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load CSV file: ${errorMessage}`);
  }
};

export const loadKeysFromCsv = async (
  filePath: string = "keys.csv"
): Promise<Entry[]> => {
  try {
    const csvContent = await Deno.readTextFile(filePath);
    const lines = csvContent.trim().split("\n");

    // Skip header row and parse CSV entries
    const dataLines = lines.slice(1);
    const csvEntries: CsvEntry[] = dataLines.map((line, index) => {
      try {
        const [contractId, keyType, key] = line.split(",");
        return {
          contractId: contractId.replace(/^"(.*)"$/, "$1").trim(),
          keyType: keyType.replace(/^"(.*)"$/, "$1").trim(),
          key: key.replace(/^"(.*)"$/, "$1").trim(),
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to parse CSV line ${index + 2}: ${errorMessage}`
        );
      }
    });

    const entries: Entry[] = [];

    for (let index = 0; index < csvEntries.length; index++) {
      const csvEntry = csvEntries[index];
      try {
        const xdrString = await parseLedgerKey(csvEntry);
        entries.push(new Entry(xdrString));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to create Entry for item ${index + 1}: ${errorMessage}`
        );
      }
    }

    console.log(`Loaded ${entries.length} entries from ${filePath}`);
    return entries;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load CSV file: ${errorMessage}`);
  }
};

const parseLedgerKey = async (entry: CsvEntry): Promise<string> => {
  switch (entry.keyType) {
    case "ScValTypeScvVec":
      return xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: new Address(entry.contractId).toScAddress(),
          key: xdr.ScVal.fromXDR(entry.key, "base64"),
          durability: xdr.ContractDataDurability.persistent(),
        })
      ).toXDR("base64");
    case "ScValTypeScvLedgerKeyContractInstance":
      return (await getContractInstanceLedgerEntry(entry.contractId)).key.toXDR(
        "base64"
      );

    default:
      throw new Error(
        `Unsupported key type: ${entry.keyType} for contract ID: ${entry.contractId}`
      );
  }
};

export const getContractInstanceLedgerEntry = async (
  contractId: string
): Promise<Api.LedgerEntryResult> => {
  const footprint = new Contract(contractId).getFootprint();

  const ledgerEntries = (await rpc.getLedgerEntries(
    footprint
  )) as Api.GetLedgerEntriesResponse;

  const contractInstance = ledgerEntries.entries.find(
    (entry) => entry.key.switch().name === "contractData"
  );

  if (!contractInstance) {
    throw new Error(
      `Contract instance not found for contract ID: ${contractId}`
    );
  }

  return contractInstance as Api.LedgerEntryResult;
};
