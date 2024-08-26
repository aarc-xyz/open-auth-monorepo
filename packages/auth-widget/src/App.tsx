import './App.css'
import { Button } from 'antd'
import { useState } from 'react'
import useAuthWidget from './hooks/useAuthWidget'
import { AarcAuthWidgetConfig, AuthMethod, OAuthProvider } from './components/types.ts'
import Provider from './provider.tsx'
import { useWallet } from './hooks/useWallet.tsx'

// App component for development and testing of the AuthWidget
function App() {

  const [data, setData] = useState<any>(null)

  const config: AarcAuthWidgetConfig = {

    Wallet: function Wallet() {
      return <div></div>
    },
    callbacks: {
      onSuccess: (data: any) => {
        setData(data)
      },
      onError: (data: any) => {
        console.log("onError", data)
      },
      onClose: (data: any) => {
        console.log("onClose", data)
      },
      onOpen: (data: any) => {
        console.log("onOpen", data)
      }
    },
    appearance: {
      logoUrl: "https://dashboard.aarc.xyz/assets/AuthScreenLogo-CNfNjJ82.svg",
      themeColor: "#FF0000",
      textColor: "blue",
      darkMode: false
    },
    authMethods: [AuthMethod.WALLET, AuthMethod.SMS, AuthMethod.EMAIL],
    socialAuth: [OAuthProvider.TELEGRAM, OAuthProvider.FARCASTER, OAuthProvider.TWITTER, OAuthProvider.GOOGLE,],
    aarcApiKey: 'aarc_api_key',
    chainId: 11155111,
    urls: {
      stytchUrls: {
        prod: "https://api.stytch.aarc.xyz/",
        staging: "https://test.stytch.com/",
      },
      pollUrls: {
        prod: "https://open-auth.aarc.xyz/",
        staging: "https://open-auth.staging.aarc.xyz/",
      },
      publicToken: {
        prod: "stytch-public-prod-token",
        staging: "stytch-public-stage-token",
      },
      redirectUrl: {
        prod: "https://auth.aarc.network/",
        staging: "https://auth-staging.aarc.network/"
      }
    },
    env: 'staging'
  }

  return (
    <div>
      <Provider config={config}>
        <Auth data={data} config={config} />
      </Provider>

    </div>
  )
}

function Auth({ data, config }: { data: any, config: any }) {
  const { openAuthWidget } = useAuthWidget()
  const sendTransaction = useWallet(config)
  const handleSendTransaction = async () => {

    sendTransaction(
      {
        from: 'fromWalletAddress',
        to: 'toWalletAddress',
        value: 2
      },
      80001,
      config.aarcApiKey
    )

  }
  return (
    <div>
      <p>{JSON.stringify(data)}</p>
      <Button
        onClick={openAuthWidget}
      >Open</Button>
      <Button onClick={() => handleSendTransaction()}>Send Transaction</Button>
    </div>
  )
}

export default App
