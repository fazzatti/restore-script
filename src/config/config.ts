import { Keypair, Networks } from "@stellar/stellar-sdk";
import { Server } from "stellar-sdk/rpc";

/**
 * Configuration module that reads from environment variables
 */

export interface Config {
  // Stellar network configuration
  stellarNetwork: Networks; // Networks.TESTNET or Networks.PUBLIC
  stellarRpcUrl: string;
  accountKeypair: Keypair;
  fee: string;
  ttlThreshold: number;
  ttlThresholdLedgerSeq: number;
  extendTtlBy: number;
  extendTtlTo: number;
}

/**
 * Gets a required environment variable or throws an error
 */
export function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

const networkEnv = getRequiredEnv("NETWORK").toLowerCase();

const networkKey =
  networkEnv === "mainnet" ? "PUBLIC" : networkEnv.toUpperCase();

if (!(networkKey in Networks)) {
  throw new Error(
    `Invalid NETWORK value: ${networkEnv}. Must be one of: ${Object.keys(
      Networks
    )
      .join(", ")
      .toLowerCase()}`
  );
}

const stellarNetwork = Networks[networkKey as keyof typeof Networks];

const accountKeypair = Keypair.fromSecret(getRequiredEnv("STELLAR_SECRET_KEY"));

const fee = getRequiredEnv("BASE_FEE") || "100"; // Default fee if not set
const ttlThreshold = parseInt(getRequiredEnv("TTL_THRESHOLD"), 10) || 100;
const extendTtlBy = parseInt(getRequiredEnv("EXTEND_TTL_BY"), 10) || 1000;
const stellarRpcUrl = getRequiredEnv("STELLAR_RPC_URL");

// Export a singleton config instance

export const rpc = new Server(stellarRpcUrl, { allowHttp: true });

const latestLedger = await rpc.getLatestLedger();
const latestLedgerSequence = latestLedger.sequence;

export const config: Config = {
  stellarNetwork,
  stellarRpcUrl,
  accountKeypair,
  fee,
  ttlThreshold,
  extendTtlBy,
  extendTtlTo: latestLedgerSequence + extendTtlBy,
  ttlThresholdLedgerSeq: latestLedgerSequence + ttlThreshold,
};

// Log the loaded configuration
console.log(`\n------------------------------------------------------------`);
console.log(`Using Stellar Network: ${config.stellarNetwork}`);
console.log(`RPC URL: ${config.stellarRpcUrl}`);
console.log(`Account Public Key: ${config.accountKeypair.publicKey()}`);
console.log(`Base Fee: ${config.fee} stroops`);
console.log(`TTL Threshold: ${config.ttlThreshold}`);
console.log(`Extend TTL By: ${config.extendTtlBy}`);
console.log(`Extend TTL To: ${config.extendTtlTo}`);
console.log(`------------------------------------------------------------\n`);
