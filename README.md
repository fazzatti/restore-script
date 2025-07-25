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

## Usage

### Development (with file watching)

```bash
deno task dev
```

### Production

```bash
deno task start
```
