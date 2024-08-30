import { useState } from 'react'
import Main from './components/main'

// component for development and testing of wallet authentication module
function App() {
  const [walletDetails, setWalletDetails] = useState()
  return (
    <>
      <div>
        <Main walletDetails={walletDetails} setWalletDetails={setWalletDetails} base_url='staging/prod-base-url' />
      </div>
    </>
  )
}

export default App

