# Open Auth Signer SDK (Ethers V6)

The Open Auth Signer SDK is a powerful tool that provides a signer class initiated with a user's authenticated session data and wallet address. It offers methods to sign messages, transactions, and send transactions from a user's social wallet. By implementing the ethers v6 Signer class, it provides access to all supported ethers v6 Signer methods without the risk of compromising wallet private keys.

## Table of Contents

- [Open Auth Signer SDK (Ethers V6)](#open-auth-signer-sdk-ethers-v6)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Local Development](#local-development)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Initialization](#initialization)
      - [Parameters:](#parameters)
    - [Signing Messages](#signing-messages)
    - [Signing Transactions](#signing-transactions)
    - [Sending Transactions](#sending-transactions)
  - [API Reference](#api-reference)
  - [Advanced Usage](#advanced-usage)
    - [Custom Provider](#custom-provider)
    - [Error Handling](#error-handling)
  - [Troubleshooting](#troubleshooting)
  - [Community](#community)

## Features

- **Secure Signing**: Sign messages and transactions without exposing wallet private keys.
- **Ethers v6 Compatibility**: Implements the ethers v6 Signer class for seamless integration.
- **Works with all EVM chains**: Supports all EVM-compatible chains with the corresponding RPC endpoint.

## Local Development

To run the Signer SDK package locally:

1. Navigate to the `signer-sdk-ethers-v6` directory:
    ```sh
    cd packages/signer-sdk-ethers-v6
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

## Installation

To install the Open Auth Signer SDK, run the following command in your project directory:

```sh
npm i @aarc-xyz/ethers-v6-signer
```

## Usage

### Initialization

To use the Open Auth Signer SDK, you need to import and initialize the `AarcEthersSigner`:

```typescript
import { AarcEthersSigner, OpenAuthProvider } from "@aarc-xyz/ethers-v6-signer";

const rpc_url = 'your rpc url here';
const sessionKey = localStorage.getItem('sessionKey');

const signer = new AarcEthersSigner(rpc_url, {
  apiKeyId: process.env.AARC_API_KEY,
  wallet_address: '<authenticated address>',
  sessionKey: sessionKey,
  chainId: 1
});
```

#### Parameters:

- `rpc_url`: RPC endpoint for the corresponding chain ID.
- `AarcBaseProps`:
  - `apiKeyId`: Your API key for the Open Auth services.
  - `wallet_address`: The authenticated address of the user's wallet (returned on successful authentication using OpenAuth Widget).
  - `sessionKey`: A unique identifier for the user's session (stored in local browser storage after successful authentication).
  - `chainId`: ID of the Ethereum network you want to interact with (e.g., 1 for mainnet).

### Signing Messages

To sign a message:

```typescript
const message = "Hello, world!";
const signature = await signer.signMessage(message);
console.log("Signature:", signature);
```

### Signing Transactions

To sign a transaction:

```typescript
import { ethers } from "ethers";

const transaction = {
  to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  value: ethers.parseEther("0.1"),
  gasLimit: 21000,
  // other transaction fields...
};

const signedTransaction = await signer.signTransaction(transaction);
console.log("Signed Transaction:", signedTransaction);
```

### Sending Transactions

To send a transaction:

```typescript
import { ethers } from "ethers";

const transaction = {
  to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  value: ethers.parseEther("0.1"),
  gasLimit: 21000,
  // other transaction fields...
};

const transactionResponse = await signer.sendTransaction(transaction);
console.log("Transaction Hash:", transactionResponse.hash);
await transactionResponse.wait(); // Wait for the transaction to be mined
```

## API Reference

The `AarcEthersSigner` class implements all methods from the ethers v6 Signer class. Some key methods include:

- `signMessage(message: string | Uint8Array): Promise<string>`
- `signTransaction(transaction: TransactionRequest): Promise<string>`
- `sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>`
- `getAddress(): Promise<string>`
- `getChainId(): Promise<number>`

For a full list of available methods, please refer to the [ethers v6 documentation](https://docs.ethers.io/v6/api/signer/).

## Advanced Usage

### Custom Provider

You can use a custom provider with the `AarcEthersSigner`:

```typescript
import { ethers } from "ethers";

const customProvider = new ethers.JsonRpcProvider(rpc_url);
const signer = new AarcEthersSigner(customProvider, {
  apiKeyId: process.env.AARC_API_KEY,
  wallet_address: '<authenticated address>',
  sessionKey: sessionKey,
  chainId: 1
});
```

### Error Handling

It's important to implement proper error handling when using the signer:

```typescript
try {
  const signature = await signer.signMessage("Hello, world!");
  console.log("Signature:", signature);
} catch (error) {
  console.error("Error signing message:", error);
}
```

## Troubleshooting

If you encounter issues:

1. Ensure you're using the correct `apiKeyId` and `wallet_address`.
2. Verify that the `sessionKey` is valid and not expired.
3. Check that you're connected to the correct network (chainId).
4. For RPC-related issues, try using a different RPC endpoint.

## Community

- Join our [Discord](https://discord.gg/3kFCfBgSdY) and [Telegram](https://t.me/aarcxyz) to discuss the project with other contributors.
- Follow our [blog](https://blog.aarc.xyz) for project updates and articles.