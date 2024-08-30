import "./App.css";
import { Button } from "antd";
import { useState } from "react";
import useAuthWidget from "./hooks/useAuthWidget";
import {
  AarcAuthWidgetConfig,
  AuthMethod,
  OAuthProvider,
} from "./components/types.ts";
import Provider from "./provider.tsx";
import { useWallet } from "./hooks/useWallet.tsx";

// App component for development and testing of the AuthWidget
function App() {
  const [data, setData] = useState<any>(null);

  const config: AarcAuthWidgetConfig = {
    Wallet: function Wallet() {
      return <div></div>;
    },
    callbacks: {
      onSuccess: (data: any) => {
        setData(data);
      },
      onError: (data: any) => {
        console.log("onError", data);
      },
      onClose: (data: any) => {
        console.log("onClose", data);
      },
      onOpen: (data: any) => {
        console.log("onOpen", data);
      },
    },
    appearance: {
      logoUrl: "https://dashboard.aarc.xyz/assets/AuthScreenLogo-CNfNjJ82.svg",
      themeColor: "#FF0000",
      textColor: "blue",
      darkMode: false,
    },
    authMethods: [AuthMethod.WALLET, AuthMethod.SMS, AuthMethod.EMAIL],
    socialAuth: [OAuthProvider.TELEGRAM, OAuthProvider.FARCASTER, OAuthProvider.TWITTER, OAuthProvider.GOOGLE,],
    clientId: 'aarc_client_id',
    chainId: 11155111,
    aarcApiKey: "294ffbcf-6a16-4e8a-8b5c-9aca09188f36",
    urls: {
      stytchUrls: {
        prod: "https://api.stytch.aarc.xyz/",
        staging: "https://test.stytch.com/",
      },
      pollUrls: {
        prod: "https://open-auth.aarc.xyz/",
        staging: "http://127.0.0.1:4002/",
      },
      publicToken: {
        prod: "stytch-public-prod-token",
        staging: "public-token-test-462fe37f-340b-456a-8dfc-6cc61d8bdadf",
      },
      redirectUrl: {
        prod: "https://auth.aarc.network/",
        staging: "https://auth.aarc.network/",
      },
    },
    env: "staging",
  };

  return (
    <div>
      <Provider config={config}>
        <Auth data={data} config={config} />
      </Provider>
    </div>
  );
}

function Auth({ data, config }: { data: any; config: any }) {
  const { openAuthWidget } = useAuthWidget();
  const sendTransaction = useWallet(config);
  const handleSendTransaction = async () => {
    sendTransaction(
      {
        from: "fromWalletAddress",
        to: "toWalletAddress",
        value: 2,
      },
      80001,
    )
  }
  return (
    <div>
      <p>{JSON.stringify(data)}</p>
      <Button onClick={openAuthWidget}>Open</Button>
      <Button onClick={() => handleSendTransaction()}>Send Transaction</Button>
    </div>
  );
}

export default App;
