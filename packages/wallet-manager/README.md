# Wallet Manager by Aarc

Aarc's Wallet Manager provides a seamless UI for users to access their accounts and interact with their assets. It allows users authenticated with any social login method to perform actions like sending tokens and importing custom ERC20 tokens on EVM chains.

## Table of Contents

- [Wallet Manager by Aarc](#wallet-manager-by-aarc)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Local Development](#local-development)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Configuration](#configuration)
    - [Integration](#integration)
  - [Community](#community)

## Features

- Seamless UI for interacting with user assets
- Support for social login authentication
- Ability to send tokens
- Import custom ERC20 tokens on EVM chains
- Extracts user's session key from browser local storage

## Local Development

To run the Wallet Manager package locally:

1. Clone the repository (if you haven't already):
   ```sh
   git clone https://github.com/aarc/auth-monorepo.git
   cd auth-monorepo
   ```

2. Navigate to the wallet-manager directory:
   ```sh
   cd packages/wallet-manager
   ```

3. Install dependencies:
   ```sh
   pnpm install
   ```

4. Start the development server:
   ```sh
   pnpm run dev
   ```

This will start a local development server, allowing you to work on and test the Wallet Manager package.

## Usage

### Installation

To install the Wallet Manager widget in your project, run the following command:

```sh
npm i @aarc-xyz/wallet-manager
```

### Configuration

Create a configuration object to customize the Wallet Manager:

```javascript
const config = {
  appearance: {
    // darkMode: true,
    themeColor: 'black',
    textColor: 'white'
  },
  walletAddress: '0x...', // User's wallet address
  profileURL: "https://...", // URL for user profile, if applicable
}
```

### Integration

Here's how to integrate the Wallet Manager into your React application:

1. Import the necessary components and styles:

```javascript
import { useWalletManager, Provider as WalletManagerProvider } from '@aarc-xyz/wallet-manager';
import '@aarc-xyz/wallet-manager/dist/style.css';
```

2. Wrap your app or component with the `WalletManagerProvider`:

```jsx
import React from 'react';
import { WalletManagerProvider } from '@aarc-xyz/wallet-manager';
import config from './config';

function App() {
  return (
    <WalletManagerProvider config={config}>
      <YourApp />
    </WalletManagerProvider>
  );
}
```

3. Use the `useWalletManager` hook in your components:

```jsx
import React from 'react';
import { useWalletManager } from '@aarc-xyz/wallet-manager';
import { Button } from 'antd';

function WalletManager() {
  const { openWalletManager } = useWalletManager()
  
  return (
    <div>
      <Button onClick={() => { 
        console.log("openWalletManager"); 
        openWalletManager();
      }}>
        Open Wallet Manager
      </Button>
    </div>
  )
}
```

The Wallet Manager automatically extracts a user's session key from the browser local storage, which is generated when a user successfully authenticates with Open Auth.

To open the Wallet Manager UI, call the `openWalletManager` function provided by the `useWalletManager` hook, as shown in the integration example above.

The Wallet Manager allows users to add custom ERC20 tokens to their wallet. This feature enables users to interact with a wider range of assets on EVM-compatible chains.

## Community

- Join our [Discord](https://discord.gg/3kFCfBgSdY) and [Telegram](https://t.me/aarcxyz) to discuss the project with other contributors.
- Follow our [blog](https://blog.aarc.xyz) for project updates and articles.