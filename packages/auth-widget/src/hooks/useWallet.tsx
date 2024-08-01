import axios from 'axios';
import { base_url } from '../constants';

interface Transaction {
    from?: string;
    to: string;
    value: string | number;
}

export function useWallet() {

    const toHex = (value: string | number): string => {
        return "0x" + (typeof value === 'number' ? value.toString(16) : parseInt(value as string).toString(16));
    };

    const getProvider = (identifier: string) => {
        //@ts-ignore
        return window.ethereum?.providers?.find((p: any) => !!p[identifier]) ?? window.ethereum;
    };

    async function sendTransaction(tx: Transaction, chainId: number, aarcApiKey: string) {
        const provider = localStorage.getItem('provider');
        const sessionKey = localStorage.getItem('sessionKey');
        const sessionIdentifier = localStorage.getItem('session_identifier');

        if (!provider) {
            throw new Error('No provider found in local storage.');
        }

        tx.value = toHex(tx.value);

        try {
            if (provider === 'metamask') {
                const metamaskProvider = getProvider('isMetaMask');
                if (!metamaskProvider) throw new Error('MetaMask provider not found.');

                const result = await metamaskProvider.request({
                    method: 'eth_sendTransaction',
                    params: [tx]
                });
                console.log(result);

            } else if (provider === 'coinbase') {
                const coinbaseProvider = getProvider('isWalletLink');
                if (!coinbaseProvider) {
                    alert("Coinbase provider not found. Please disconnect other wallets.");
                    return;
                }

                return coinbaseProvider.request({
                    method: 'eth_sendTransaction',
                    params: [tx]
                });

            } else if (provider === 'walletConnect') {

                tx.value = (typeof tx.value === 'number' ? tx.value * 1e18 : parseFloat(tx.value) * 1e18);
                const walletConnectProvider = getProvider('isWalletConnect');
                if (!walletConnectProvider) throw new Error('WalletConnect provider not found.');

                return walletConnectProvider.request({
                    method: 'eth_sendTransaction',
                    params: [tx]
                });

            } else {
                throw new Error(`Unsupported provider: ${provider}`);
            }
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }

        // Remove 'from' field from transaction object
        const { from, ...transactionWithoutFrom } = tx;


        return axios.post(`${base_url}send-transaction`, {
            provider,
            session_identifier: sessionIdentifier,
            transaction: transactionWithoutFrom,
            sessionKey,
            chainId
        }, {
            headers: {
                "x-api-key": aarcApiKey
            }
        });
    }

    return sendTransaction;
}
