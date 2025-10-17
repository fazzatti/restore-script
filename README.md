# Restore Script

## Requirements

- [Deno](https://deno.land/) - Modern runtime for JavaScript and TypeScript

## Setup

1. Copy the environment configuration:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   - Set your `STELLAR_SECRET_KEY` with the account to be used as the source for the transactions
   - Set `CONTRACT_ID` for the contract you want to restore/extend entries for (used by the default mode)
   - Configure `NETWORK` (testnet, mainnet, futurenet, etc.)
   - Set `STELLAR_RPC_URL` for your chosen network
   - Modify the following parameters to adjust the transactions and logic:
     - `BASE_FEE` : The base fee in stroops (1 stroop = 0.0000001 XLM)
     - `TTL_THRESHOLD`: Any entry with a TTL set to expire in this many ledgers will be considered for extension.
     - `EXTEND_TTL_BY`: When extending an entry TTL, it will be extended by this many ledgers from now. (1 ledger ≈ 5s)

## Modes

This project supports two modes to load entries:

- Default (API) mode — fetches entries directly from Stellar Expert API for the `CONTRACT_ID` defined in your environment.
- CSV mode — load entries from a local CSV file. Use this when you want to process a curated list instead of fetching everything.

## Usage

### Default Mode (Load from Stellar Expert API)

The default mode automatically fetches persistent and instance entries for the contract specified in `CONTRACT_ID` using the Stellar Expert API.

To check the entries state and produce a CSV with their statuses (no transactions submitted):

```bash
deno task check
```

To execute the restore and extend transactions (will submit operations to the network):

```bash
deno task run
```

### CSV Mode (Load from CSV file)

If you have a specific set of entries in a CSV file, you can use the CSV mode instead. This treats the CSV as the source of truth for the entries to process.

To check entries from CSV without executing transactions:

```bash
deno task check:csv
```

To execute restore/extend for entries from CSV:

```bash
deno task run:csv
```

### Options

- The fetch process uses a configurable delay between requests to avoid rate limiting. Default is 500ms — adjust via the code or environment as needed.
- You can control page size (limit) and maximum records to fetch in the fetch options inside the code (see `src/expert-api/index.ts`).
- You can filter by `durability` ("temporary" | "persistent" | "instance") when fetching via the Expert API.

## Output

Both modes will generate an output CSV file with the status for each entry, including:

- Entry key
- Current TTL
- Whether it was restored or extended
- Transaction status (if executed)

## Notes

- Default behavior is to fetch from Stellar Expert API by `CONTRACT_ID`. CSV mode is available when you need to process a specific list.
- The script uses a small delay between requests (default 500ms) to reduce the chance of hitting rate limits on the Stellar Expert API.
- When fetching pages, the script follows the cursor returned by the API and stops when no records are returned or when a `maxRecords` limit is reached.
