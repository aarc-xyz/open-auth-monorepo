import { useEffect, useState } from "react";
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { getCoinbaseWalletProvider, getMetaMaskProvider } from "./walletProviders";
import coinbase from '../assets/coinbase.svg';
import metamask from '../assets/metamask.svg';
import walletconnect from '../assets/walletConnect.svg';
import { randomBytes } from "@stablelib/random";
import { SiweMessage } from "siwe";
import { getAddress } from 'ethers';


const generateNonce = (length = 16): string => {
    const nonce = randomBytes(length);
    return Array.from(nonce).map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const buildMessage = (currentURI: string, chainID: number, nonce: string, issuedAt: string, walletAddress: string): string => {
    return `${currentURI} wants you to sign in with your Ethereum account:\n${walletAddress}

By signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.
    
URI: 
${currentURI}
    
Version: 
1

Chain ID: 
${chainID}

Nonce: 
${nonce}

Issued At: 
${issuedAt}

`;
};


interface MainProps {
    setWalletDetails: (details: any) => void;
    walletDetails: any;
    aarc_api_key: string;
    base_url: string;
}


export default function Main({ setWalletDetails, walletDetails, aarc_api_key, base_url }: MainProps) {
    const [provider, setProvider] = useState<any>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [signature, setSignature] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [signedMessage, setSignedMessage] = useState<string>("");
    const currentURI = window.location.href;

    useEffect(() => {
        setWalletDetails({
            ...walletDetails,
            provider,
            signedMessage,
            signature,
            error,
            account,
            sendTransaction
        });
    }, [provider, signedMessage, signature, error, account]);

    const callExternalWallets = async (account: string, signature: string, message: string, provider: string, nonce: string) => {
        const data = { address: account, message, signature, walletType: provider, nonce };

        try {
            const response = await fetch(`${base_url}external-wallet`, {
                method: 'POST',
                headers: {
                    'x-api-key': aarc_api_key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            walletDetails?.onSuccess(result);
        } catch (error) {
            walletDetails?.onError(error);
            console.error('Error:', error);
        }
    };

    const signMessage = async (provider: any, type: string) => {
        if (!provider) return;

        try {
            setProvider(provider);
            localStorage.setItem('provider', type);

            const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            setAccount(account);

            const nonce = generateNonce();
            const siweMessage = new SiweMessage({
                statement: 'Login to Aarc',
                domain: window.location.origin,
                nonce,
                address: getAddress(account),
                uri: window.location.href,
                version: '1',
                chainId: window.ethereum.networkVersion
            });

            const newMessage = siweMessage.prepareMessage();
            setSignedMessage(newMessage);

            const signature = await provider.request({ method: 'personal_sign', params: [newMessage, account] });
            setSignature(signature);

            callExternalWallets(account, signature, newMessage, type, nonce);
        } catch (error: any) {
            console.error(error);
            setError(error.message);
        }
    };

    const walletConnect = async () => {
        setWalletDetails({ ...walletDetails, provider: 'walletConnect' });
        localStorage.setItem('provider', 'walletConnect');

        try {
            const provider = await EthereumProvider.init({
                projectId: '98f10d813d8b1c4b0c8d355e298eefef',
                metadata: {
                    name: 'Aarc Auth Widget',
                    description: 'Aarc Auth Widget',
                    url: window.location.href,
                    icons: ['https://avatars.githubusercontent.com/u/37784886']
                },
                showQrModal: true,
                optionalChains: [1, 137, 2020]
            });

            await provider.connect();
            const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            setAccount(account);

            const nonce = generateNonce();
            const newMessage = buildMessage(currentURI, window.ethereum.networkVersion, nonce, new Date().toISOString(), account);
            setSignedMessage(newMessage);

            const signature: string = await provider.request({ method: 'personal_sign', params: [newMessage, account] });
            setSignature(signature);

            callExternalWallets(account, signature, newMessage, "walletConnect", nonce);
        } catch (error: any) {
            console.error(error);
            setError(error.message);
        }
    };

    const sendTransaction = async (walletProvider: string, data: any) => {
        const providers: Record<string, any> = {
            'coinbase': getCoinbaseWalletProvider(),
            'metamask': getMetaMaskProvider(),
            'walletConnect': walletConnect()
        };
        const provider = providers[walletProvider];
        return provider.request({ method: 'eth_sendTransaction', params: [data] });
    };

    const buttonStyle: React.CSSProperties = {
        borderRadius: '8px',
        border: '1px solid #EDEDED',
        padding: '0.6em 1.2em',
        fontSize: '1em',
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'border-color 0.25s',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '12px',
        position: 'relative'
    };

    const Button = ({ onClick, imgSrc, label }: { onClick: () => void, imgSrc: string, label: string }) => (
        <button style={buttonStyle} onClick={onClick}>
            <img src={imgSrc} alt={label} />
            {label}
            <div style={{ position: 'absolute', right: '8px', top: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </button>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button onClick={() => signMessage(getCoinbaseWalletProvider(), 'coinbase')} imgSrc={coinbase} label="Coinbase" />
            <Button onClick={() => signMessage(getMetaMaskProvider(), 'metamask')} imgSrc={metamask} label="Metamask" />
            <Button onClick={() => walletConnect()} imgSrc={walletconnect} label="WalletConnect" />
        </div>
    );
}
