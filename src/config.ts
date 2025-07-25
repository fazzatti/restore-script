import { Account, Keypair, Networks } from "@stellar/stellar-sdk";
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
}

/**
 * Loads configuration from environment variables with defaults
 */
export function loadConfig(): Config {
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

  const accountKeypair = Keypair.fromSecret(
    getRequiredEnv("STELLAR_SECRET_KEY")
  );

  const fee = getRequiredEnv("BASE_FEE") || "100"; // Default fee if not set

  const config: Config = {
    stellarNetwork,
    stellarRpcUrl: getRequiredEnv("STELLAR_RPC_URL"),
    accountKeypair,
    fee,
  };

  return config;
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

// Export a singleton config instance
export const config = loadConfig();

export const rpc = new Server(config.stellarRpcUrl, { allowHttp: true });

// Log the loaded configuration
console.log(`\n------------------------------------------------------------`);
console.log(`Using Stellar Network: ${config.stellarNetwork}`);
console.log(`RPC URL: ${config.stellarRpcUrl}`);
console.log(`Account Public Key: ${config.accountKeypair.publicKey()}`);
console.log(`Base Fee: ${config.fee} stroops`);
console.log(`------------------------------------------------------------\n`);
