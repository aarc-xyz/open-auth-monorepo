import AuthModal from "./components/modal"
import { AuthWidgetProvider } from "./hooks/useAuthWidget"
import { ConfigProvider, theme } from "antd"
import './App.css'
import './index.css'
import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { AarcAuthWidgetConfig } from "./components/types"

const farcasterConfig = {

    relay: "https://relay.farcaster.xyz",
    rpcUrl: "https://mainnet.optimism.io",
    domain: window.location.hostname,
    siweUri: window.location.origin,
};


export default function WidgetProvider({ children, config }: { children: React.ReactNode, config: AarcAuthWidgetConfig }) {
    return (
        <ConfigProvider
            theme={{
                algorithm: config.appearance.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: config.appearance.themeColor,
                    colorTextLightSolid: config.appearance.textColor
                }
            }}>
            <AuthKitProvider config={farcasterConfig}>
                <AuthWidgetProvider>
                    {children}
                    <AuthModal config={config} />
                </AuthWidgetProvider>
            </AuthKitProvider>
        </ConfigProvider>
    )
}