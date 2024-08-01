import React from 'react';
import { AarcAuthWidgetConfig, step } from './types';
import { base_url } from '../constants';
import useAuthWidget from '../hooks/useAuthWidget';

interface BrowserWalletProps {
    config: AarcAuthWidgetConfig
    setStep: (step: step) => void;
    setWalletDetails: React.Dispatch<React.SetStateAction<any>>;
}

const BrowserWallets: React.FC<BrowserWalletProps> = ({
    config,
    setStep,
    setWalletDetails
}) => {

    const { Wallet } = config
    const { openAuthWidget } = useAuthWidget();

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="absolute top-6 left-6 cursor-pointer" onClick={() => setStep("home")}>
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M17 7H1M1 7L7 13M1 7L7 1"
                        stroke="#A3A3A3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <p className="text-[16px] top-[22px]">Wallets</p>
            <div className={`w-full mt-[34px] ${config.appearance.darkMode ? "wallet-div" : "wallet-div-light"}`}>
                {Wallet && <Wallet
                    aarc_api_key={config.aarcApiKey}
                    base_url={base_url}
                    walletDetails={{
                        onSuccess: (account: string) => {
                            config.callbacks.onSuccess(account);
                            openAuthWidget();
                        },
                        onError: (error: any) => {
                            config.callbacks.onError(error);
                            setStep('error');
                        }
                    }}
                    setWalletDetails={setWalletDetails}
                />}
            </div>
        </div>
    );
};

export default BrowserWallets;
