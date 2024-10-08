# OpenAuth Monorepo

Welcome to the OpenAuth Monorepo! This repository houses multiple packages designed to streamline user onboarding in Web3 applications and enable the development of smooth omnichain dApps.

[![Discord](https://img.shields.io/badge/Discord-Join%20Chat-7289DA?style=flat&logo=discord&logoColor=white)](https://discord.gg/3kFCfBgSdY) [![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue?style=flat&logo=telegram)](https://t.me/aarcxyz)

## Table of Contents

- [OpenAuth Monorepo](#openauth-monorepo)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Architecture](#architecture)
    - [Authentication Flow](#authentication-flow)
  - [Key Features](#key-features)
  - [Packages](#packages)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Auth Widget](#auth-widget)
      - [Installation](#installation)
      - [Configuration](#configuration)
      - [Integration](#integration)
      - [Usage](#usage)
    - [Wallet Manager](#wallet-manager)
      - [Installation](#installation-1)
      - [Configuration](#configuration-1)
      - [Integration](#integration-1)
      - [Usage](#usage-1)
    - [Signer SDK Ethers V6](#signer-sdk-ethers-v6)
      - [Installation](#installation-2)
      - [Usage](#usage-2)
  - [Contributing](#contributing)

## Overview

OpenAuth kit provides developers with tools to easily onboard users to their dApps using preferred login methods such as Google, X, Discord, Email, SMS, and Farcaster. The kit enables users to perform on-chain activities with their social logins, maintaining complete control over their assets through non-custodial wallet management secured by Multi-Party Computation (MPC).

## Architecture

OpenAuth leverages the Lit Protocol to generate Programmable Key Pairs (PKPs) via Distributed Key Generation (DKG), ensuring enhanced security.

### Authentication Flow

1. User sign-in triggers a check for existing PKP within the Lit network.
2. If no PKP exists, a new one is created.
3. Existing PKPs authenticate users via associated methods.
4. Successful authentication generates SessionSigs from a randomly created ed25519 keypair.
5. These session keys sign user-initiated transactions and messages.

## Key Features

- Streamlined Single Sign-On (SSO)
- Interoperability without vendor lock-in
- Session keys for temporary cryptographic operations
- Unified access with WalletConnect
- Multiple supported login providers
- Customizable modal and in-dapp wallet manager
- In-built key rotation for enhanced security

## Packages

1. **`auth-sdk`**: Core authentication library
2. **`auth-widget`**: UI for creating Web3 wallets with various login methods
3. **`wallet-auth`**: Wallet authentication management
4. **`wallet-manager`**: Comprehensive wallet management solution

## Getting Started

### Prerequisites

- Node.js (>=14.x)
- pnpm (>=6.x)
- Running [Backend Server](https://github.com/aarc-xyz/service-open-auth-backend)
- Running [Redirect Application](https://github.com/aarc-xyz/open-auth-redirect)

### Auth Widget

#### Installation

```sh
npm install @aarc-xyz/auth-widget @aarc-xyz/wallet-auth
```

#### Configuration

You need to run [Backend Server](https://github.com/aarc-xyz/service-open-auth-backend) and [Redirect Application](https://github.com/aarc-xyz/open-auth-redirect) to use the widget.

```tsx
import Wallets from '@aarc-xyz/wallet-auth'

const config: AuthConfig = {
  Wallet: Wallets,
  appearance: {
    logoUrl: 'https://dashboard.aarc.xyz/assets/AuthScreenLogo-CNfNjJ82.svg',
    themeColor: '#2D2D2D',
    darkMode: true
  },
  callbacks: {
    onSuccess: (data: any) => console.log(data),
    onError: (data: any) => console.log("onError", data),
    onClose: (data: any) => console.log("onClose", data),
    onOpen: (data: any) => console.log("onOpen", data)
  },
  authMethods: ['email', 'wallet'],
  socialAuth: ['google'],
  urls: {
      stytchUrls: {
        prod: "YOUR_STYTCH_PROD_URL", // Get this from stytch dashboard
        staging: "https://test.stytch.com/",
      },
      pollUrls: {
        prod: "YOUR_BACKEND_PROD_URL", // Replace with your backend URL
        staging: "YOUR_BACKEND_STAGING_URL", // Replace with your backend URL
      },
      publicToken: {
        prod: "YOUR_STYTCH_PROD_PUBLIC_TOKEN", // Get this from stytch dashboard
        staging: "YOUR_STYTCH_STAGING_PUBLIC_TOKEN", // Get this from stytch dashboard
      },
      redirectUrl: {
        prod: "RUNNING_APP_URL",  // Replace with your redirect app URL 
        staging: "RUNNING_APP_URL", 
      },
    },
  chainId: 11155111, // Replace with your chainId
};
```

#### Integration

```tsx
import { Provider } from '@aarc-xyz/auth-widget';
import '@aarc-xyz/auth-widget/dist/style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider config={config}>
    <App />
  </Provider>
);
```

**Note for NextJS**: Add `'use client'` at the top of the file to ensure the widget runs on the client side.

#### Usage

```tsx
import { useAuthWidget } from '@aarc-xyz/auth-widget';

function Auth() {
  const { openAuthWidget } = useAuthWidget()

  useEffect(() => {
    openAuthWidget()
  }, [])

  return <div>{/* Your component content */}</div>
}
```

### Wallet Manager

#### Installation

```sh
npm i @aarc-xyz/wallet-manager
```

#### Configuration

```javascript
const config = {
  appearance: {
    themeColor: 'black',
    textColor: 'white'
  },
  walletAddress: '0x...',
  profileURL: "https://...",
}
```

#### Integration

```jsx
import { WalletManagerProvider } from '@aarc-xyz/wallet-manager';
import '@aarc-xyz/wallet-manager/dist/style.css';

function App() {
  return (
    <WalletManagerProvider config={config}>
      <YourApp />
    </WalletManagerProvider>
  );
}
```

#### Usage

```jsx
import { useWalletManager } from '@aarc-xyz/wallet-manager';

function WalletManager() {
  const { openWalletManager } = useWalletManager()

  return (
    <Button onClick={openWalletManager}>
      Open Wallet Manager
    </Button>
  )
}
```

### Signer SDK Ethers V6

The Signer SDK Ethers V6 provides a signer class that can be initiated with a user's authenticated session data and wallet address. It offers methods to sign messages, transactions, and send transactions from a user's social wallet, implementing the ethers v6 Signer class.

#### Installation

```sh
npm i @aarc-xyz/ethers-v6-signer
```

#### Usage

```typescript
import { AarcEthersSigner, OpenAuthProvider } from "@aarc-xyz/ethers-v6-signer";

const rpc_url = 'your rpc url here';
const sessionKey = localStorage.getItem('sessionKey');

const signer = new AarcEthersSigner(rpc_url, {
  wallet_address: '<authenticated address>',
  sessionKey: sessionKey,
  chainId: 1
});

// Signing a message
const message = "Hello, world!";
const signature = await signer.signMessage(message);

// Signing a transaction
const transaction = {
  to: "0x...",
  value: ethers.parseEther("0.1"),
  gasLimit: 21000,
};

const signedTransaction = await signer.signTransaction(transaction);

// Sending a transaction
const transactionResponse = await signer.sendTransaction(transaction);
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how you can help improve OpenAuth.

For more detailed information on each package, please refer to their individual README files:

- [Auth SDK README](packages/auth-sdk/README.md)
- [Auth Widget README](packages/auth-widget/README.md)
- [Wallet Auth README](packages/wallet-auth/README.md)
- [Wallet Manager README](packages/wallet-manager/README.md)
- [Signer SDK Ethers V6 README](packages/signer-sdk-ethers-v6/README.md)

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for more details.