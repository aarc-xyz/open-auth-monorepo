
import './App.css'
import useWalletManager from './hooks/useWalletManager'
import { Button } from 'antd'
import WalletManagerProvider from './Provider'

function App() {

  const config = {
    appearance: {
      // darkMode: true,
      themeColor: 'black',
      textColor: 'white'
    },
    walletAddress: '0x7C1a357e76E0D118bB9E2aCB3Ec4789922f3e050',
    profileURL: "https://lh3.googleusercontent.com/a/ACg8ocJgvyoM8H1Ff-fk3OJSd0PRkfFx9vYwXkOkE_VGk_L5wefi4PYo=s96-c",
  }

  return (
    <div>
      <WalletManagerProvider config={config}>
        <WalletManager />
      </WalletManagerProvider>
    </div>
  )
}

function WalletManager() {
  const { openWalletManager } = useWalletManager()
  return (
    <div>
      <Button onClick={() => { console.log("openWalletManager"); openWalletManager() }}>Open Wallet Manager</Button>
    </div>
  )
}

export default App
