# Auth Widget by Aarc

The OpenAuth Widget by Aarc provides a seamless authentication solution for web applications, enabling secure and straightforward integration with various social and traditional auth methods. This widget is designed to support developers by simplifying the user authentication process using both Web3 and conventional authentication methods.

## Table of Contents

- [Auth Widget by Aarc](#auth-widget-by-aarc)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Authentication Methods](#authentication-methods)
  - [Local Development](#local-development)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Configuring the Widget](#configuring-the-widget)
    - [Integrating the Provider](#integrating-the-provider)
    - [Using the Widget](#using-the-widget)
    - [Send-Transaction Functionality](#send-transaction-functionality)
  - [Community](#community)

## Features

- Easy integration with React applications
- Support for multiple authentication methods
- Customizable appearance
- Callbacks for various authentication events

## Authentication Methods

- **External Wallet**: Users can authenticate using their cryptocurrency wallet.
- **Farcaster**: Users can log in using Farcaster.
- **Twitter**: Users can log in using their Twitter account.
- **Google**: Users can log in using their Google account.
- **Email**: Users can log in using their email address.
- **Phone**: Users can log in using their phone number.
- **PassKeys**: Users can log in using their PassKeys.

## Local Development

To run the Auth Widget package locally:

1. Navigate to the `auth-widget` directory:
    ```sh
    cd packages/auth-widget
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

3. Configure the `AuthWidgetConfig` object in `src/App.tsx`. See [Configuring the Widget](#configuring-the-widget) for details.

4. Start the development server:
    ```sh
    pnpm run dev
    ```

## Usage

### Installation

Install the Auth Widget package adn `wallet-auth` (only if you need to connect with EOAs) in your React application:

```sh
npm install @aarc-xyz/auth-widget @aarc-xyz/wallet-auth
```

### Configuring the Widget

You need to run [Backend Server](https://github.com/aarc-xyz/service-open-auth-backend) and [Redirect Application](https://github.com/aarc-xyz/open-auth-redirect) to use the widget. 
Create a configuration object to customize the widget:

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

### Integrating the Provider

Wrap your main application component with the `Provider`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from '@aarc-xyz/auth-widget';
import '@aarc-xyz/auth-widget/dist/style.css'
import { config } from './config';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <Provider config={config}>
    <App />
  </Provider>
);
```

**Note for NextJS**: Add `'use client'` at the top of the file to ensure the widget runs on the client side.

### Using the Widget

Implement the widget in your component:

```tsx
import { useAuthWidget } from '@aarc-xyz/auth-widget';

function Auth() {
  const { openAuthWidget } = useAuthWidget()

  useEffect(() => {
    console.log('Auth widget mounted')
    openAuthWidget()
    return () => {
      console.log('Auth widget unmounted')
    }
  }, [])

  return (
    <div>
      {/* Your component content */}
    </div>
  )
}
```

### Send-Transaction Functionality

Use the `useWallet` hook to implement blockchain transactions:

```tsx
import { useWallet } from '@aarc-xyz/auth-widget'

const sendTransaction = useWallet();

sendTransaction(
  {
    to: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2', // receiver's wallet address
    value: '0x29a2241af62c0000' // value in hex
  }, 
  11155111, // Replace with your chainId
);
```

## Community

- Join our [Discord](https://discord.gg/3kFCfBgSdY) and [Telegram](https://t.me/aarcxyz) to discuss the project with other contributors.
- Follow our [blog](https://blog.aarc.xyz) for project updates and articles.