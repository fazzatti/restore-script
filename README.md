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
   - Configure `NETWORK` (testnet, mainnet, futurenet, etc.)
   - Set `STELLAR_RPC_URL` for your chosen network
   - Modify the following parameters to adjust the transactions and logic:
     - `BASE_FEE` : The base fee in stroops ( 1 stroop = 0.0000001 XLM )
     - `TTL_THRESHOLD`: Any entry with a TTL set to expire in this many ledgers, will be have it extended.
     - `EXTEND_TTL_BY`: When extending an entry TTL, it will be for this many ledgers from now. (1 ledger = ~5 sec)

## Usage

To load the entries state and output a CSV with their statuses based on the parameters, run the following command. This won't submit any transactions as it is meant to just check on the up-to-date state for the entries.

```bash
deno task check
```

To trigger the sequential execution of the restore and extend transactions, run the following command. An output CSV is provided at the end with the updated status for the entries.

```bash
deno task run
```
