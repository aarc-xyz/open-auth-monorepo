import { ConfigProvider, theme } from 'antd'
import WalletManagerModal from './components/Modal'
import { WalletManagerProvider } from './hooks/useWalletManager'
import './index.css'
import './App.css'
export default function Provider({ children, config }: any) {

    return (
        <ConfigProvider
            theme={{
                algorithm: config.appearance.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: config.appearance.themeColor,
                    colorTextLightSolid: config.appearance.textColor

                }
            }}>
            <WalletManagerProvider>
                {children}
                <WalletManagerModal config={config} />
            </WalletManagerProvider>
        </ConfigProvider>
    )
} 