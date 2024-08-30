import passkeyLight from '../assets/passkey-light.png'
import passkeyDark from '../assets/passkey-dark.png'
import { Button } from 'antd'
import { startRegistration } from "@simplewebauthn/browser";
import useAuthWidget from '../hooks/useAuthWidget';

import { AarcAuthWidgetConfig, PollResponse, step } from './types';
import { pollResponse } from '../../../auth-sdk/src/types';

interface PasskeyComponentProps {
    config: AarcAuthWidgetConfig;
    sessionIdentifier: string;
    newWalletAddress: string;
    userData: pollResponse | null;
    setStep: React.Dispatch<React.SetStateAction<step>>;
    setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
}


const PasskeyComponent = ({ config, sessionIdentifier, newWalletAddress, userData, setStep, setLoadingMessage }: PasskeyComponentProps) => {

    const { openAuthWidget } = useAuthWidget();
    const base_url = config.urls.pollUrls[config.env]

    const handleRegistration = async () => {
        try {
            setStep('loading')
            setLoadingMessage('Please link your passkey')
            const res = await fetch(`${base_url}webauthn-register-options/${sessionIdentifier}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const body = await res.json();
            const credential = await startRegistration(body.data);

            const payload =
            {
                id: credential.id,
                rawId: credential.rawId,
                attestationObject: credential.response.attestationObject,
                wallet_address: newWalletAddress,
                clientDataJSON: credential.response.clientDataJSON,
                authenticatorData: credential.response.authenticatorData,
            }


            const response = await fetch(`${base_url}register-webauthn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            await response.json()

            config.callbacks.onSuccess(userData as PollResponse)
            setStep('home')
            openAuthWidget()
        } catch (error) {
            console.error(error);
            setStep('error')
        }
    };
    return (
        <div className='mt-5'>
            <img src={config.appearance.darkMode ? passkeyDark : passkeyLight} className='mx-auto' alt="passkey-light" />
            <div className='flex gap-2 flex-col'>
                <p className='text-base font-semibold leading-[21.79px] text-center'>Link a passkey</p>
                <p className='text-sm font-normal leading-[19.07px] text-center text-[#686868]'>Enhance your security: Link a passkey to your account for superior protection and effortless seamless access.</p>
                <Button
                    onClick={handleRegistration}
                    type="primary" className=' h-[44px] w-full mb-2 mt-5'
                    htmlType="submit"
                >Link</Button>
            </div>

        </div>
    )
}

export default PasskeyComponent