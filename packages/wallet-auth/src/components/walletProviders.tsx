import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

const APP_NAME = "Aarc Auth Widget";
const APP_LOGO_URL = "https://dashboard.aarc.xyz/assets/AuthScreenLogo-CNfNjJ82.svg";
// replace with your own Infura ID
const INFURA_ID = "INFURA_ID"
const INFURA_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_ID}`;
const DEFAULT_CHAIN_ID = 1;

export const getCoinbaseWalletProvider = () => {
    const coinbaseWallet = new CoinbaseWalletSDK({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        darkMode: false,
        overrideIsMetaMask: false
    });
    return coinbaseWallet.makeWeb3Provider(INFURA_RPC_URL, DEFAULT_CHAIN_ID);
};

export const getMetaMaskProvider = () => {
    return (
        //@ts-ignore
        window.ethereum?.providers?.find((p) => !!p.isMetaMask) ?? window.ethereum
    );
};


