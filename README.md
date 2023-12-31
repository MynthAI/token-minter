# Token Minting

This project includes a tool to mint Cardano native tokens. It utilizes
[Blockfrost](https://blockfrost.io/) and
[Lucid](https://lucid.spacebudz.io/) to interact with the blockchain.

## Prerequisites

- Node.js (v18.16.1)
- npm (v9.7.2 or later)

## Development

Install dependencies using `npm`:

``` bash
npm install
```

### Run locally

Call the following to simulate the minting process:

``` bash
npm run start
```

This will build a transaction to mint a token but will not submit it to
the blockchain. To submit the transaction, set the `MINT` environment
variable to `true`:

``` bash
MINT=true npm run start
```

### Vault

This project uses Vault for secret storage. Secrets are stored under the
path `token-minter`. To activate this path in your
[local-vault](https://github.com/MynthAI/local-vault) instance, execute
the following command:

``` bash
docker exec vault vault secrets enable -path=token-minter -version=1 kv
```

### Blockfrost

This project utilizes the [Blockfrost API](https://blockfrost.dev/) to
interact with the Cardano blockchain. To enable the application to
access your Blockfrost API key, it must be stored in Vault. Within your
Blockfrost account, you should possess two API keys: one for the mainnet
and another for preview. The Token Minter depends on the preview key.
Here’s the method to save it to Vault:

``` bash
vault-cli set -p token-minter/blockfrost api_key
```

### Minting Wallet

This project utilizes a Cardano wallet to mint tokens. To be able to
mint tokens, you must store the wallet seed phrase in Vault. For testing
purposes, you can generate your own seed phrase and fund it using
[testnets
faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/). Here’s
the method to save it to Vault:

``` bash
vault-cli set -p token-minter/wallets minter
```

## Creating a Token Owner Wallet

You need an owner wallet to mint a token. This wallet is authorized to
mint the token and serves as proof of its creator. Follow the steps
below to create an owner wallet and store it in the Vault:

``` bash
npm run generate-owner
```

## Configuring the Token

This repository allows minting of any token. You can configure what
token to mint by modifying the `config/default.yml` file. Update the
details in this file to change the token you want to mint.

## Installing token-metadata-creator

The `token-metadata-creator` tool is responsible for asset/token
metadata creation and validation. To use it, you can download the
pre-built binaries from the
[releases](https://github.com/input-output-hk/offchain-metadata-tools#pre-built-binaries)
section. Choose the appropriate binary for your platform and follow the
installation instructions for your operating system. Extract the
downloaded archive and place the binary file in a directory specified by
the PATH environment variable. For example, you can place it in
`$HOME/.local/bin/` or any other directory included in the PATH.

## Creating a Token Metadata

To generate metadata for your assets (tokens), make sure you have
`token-metadata-creator` installed, and then follow these steps:

``` bash
npm run generate-metadata
```
