
import React, { useState } from 'react'

const WalletManagerContext = React.createContext({
    isWalletManagerOpen: false,
    openWalletManager: () => { },
})

export default function useWalletManager() {
    const { isWalletManagerOpen, openWalletManager } = React.useContext(WalletManagerContext)
    return {
        isWalletManagerOpen,
        openWalletManager: () => { openWalletManager() },
    }
}

export function WalletManagerProvider({ children }: { children: React.ReactNode }) {
    const [isWalletManagerOpen, setIsWalletManagerOpen] = useState(false)

    const openWalletManager = () => {
        setIsWalletManagerOpen(!isWalletManagerOpen)
    }

    return (
        <WalletManagerContext.Provider value={{ isWalletManagerOpen, openWalletManager }}>
            {children}
        </WalletManagerContext.Provider>
    )
}



