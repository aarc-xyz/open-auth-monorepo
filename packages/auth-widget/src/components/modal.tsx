import Modal from "antd/es/modal/Modal";
import OAuthSection from './OAuthSection'
import { Form, Button, Input, Select, Result } from 'antd';
import Footer from "./footer";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import SwitchToSMS from "./SwitchToSMS";
import useAuthWidget from '../hooks/useAuthWidget';
import AuthSDK from "@aarc-xyz/auth-sdk"

import { AarcAuthWidgetConfig, AuthMethod, PollResponse, ProviderKey, sessionKeys, step } from "./types";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import { v4 } from "uuid";
import { startAuthentication } from "@simplewebauthn/browser";
import axios from "axios";
import PasskeyComponent from "./Passkey";
import BrowserWallets from "./BrowserWallets";

const options = [
    {
        value: '+91',
        label: 'IN',
    },
    {
        value: '+01',
        label: 'US',
    },
];


export default function AuthModal({ config }: { config: AarcAuthWidgetConfig }) {
    const env = config.env
    const auth = new AuthSDK(config.aarcApiKey, config.chainId, env, config.urls)
    const { authMethods } = config
    const { isAuthWidgetOpen, openAuthWidget } = useAuthWidget();
    const [form] = Form.useForm();
    const [step, setStep] = useState<step>('home')
    const [isEmail, setIsEmail] = useState<boolean>(true)
    const [isOTPEnabled, setIsOTPEnabled] = useState<boolean>(false)
    const [provider, setProvider] = useState<ProviderKey>("google")
    const [email, setEmail] = useState<string>("")
    const [otp, setOTP] = useState<string>("")
    const [isContinueLoading, setContinueLoading] = useState<boolean>(false)
    const [methodId, setMethodId] = useState<string | null>(null)
    const [phone, setPhone] = useState("")
    const [countryCode, setCountryCode] = useState("+91")
    const [sessionIdentifier, setSessionIdentifier] = useState<string>("")
    const [newWalletAddress, setNewWalletAddress] = useState<string>("")
    const [userData, setUserData] = useState<PollResponse | null>(null)
    const [loadingMessage, setLoadingMessage] = useState<string>("")
    const [walletDetails, setWalletDetails] = useState<any>({
        onSuccess: () => {
            openAuthWidget()
        }
    })
    const base_url = config.urls.pollUrls[env]
    useEffect(() => {
        setProvider(walletDetails.provider)
    }, [walletDetails.provider])


    const sendOTP = () => {

        setContinueLoading(true)
        const data = isEmail ? email : countryCode + phone

        auth.sendOTP(isEmail, data).then((res) => {
            if (res.status == 'success') {
                setMethodId(res.data.data.email_id)
                setIsOTPEnabled(true)
            } else {
                setStep("error")
            }
        }).finally(() => {
            setContinueLoading(false)
        })

    }

    const verifyOTP = () => {
        const session_identifier = Math.random().toString(36).substring(7);
        setContinueLoading(true)

        if (isEmail) {
            setProvider("email")
            localStorage.setItem('provider', 'email')
            if (!methodId) {
                setStep("error")
                return
            }
            auth.verifyOTP(session_identifier, isEmail, methodId, otp).then((res) => {
                if (res.status == 'success') {
                    setMethodId(res.data.email_id)
                    openAuthWidget()
                    config?.callbacks?.onSuccess(res)
                } else {
                    setStep("error")
                }
            }).finally(() => {
                setContinueLoading(false)
            })
        }
        else {
            setProvider("sms")
            localStorage.setItem('provider', 'sms')
            auth.verifyOTP(session_identifier, isEmail, countryCode + phone, otp).then((res) => {
                if (res.status == 'success') {
                    setMethodId(res.data.email_id)
                    openAuthWidget()
                    config?.callbacks?.onSuccess(res)
                } else {
                    setStep("error")
                }
            }).finally(() => {
                setContinueLoading(false)
            })
        }
    }

    const handleFormFinish = () => {

        if (isOTPEnabled) {
            verifyOTP()
        } else {
            sendOTP()
        }
    }

    const handleLoginWithPasskey = async () => {

        const options: PublicKeyCredentialRequestOptionsJSON = {
            userVerification: 'required',
            challenge: "",
            timeout: 60000,
        };

        try {
            const credential = await startAuthentication(options);
            const sessionIdentifier = v4().slice(0, 8)
            const payload = {
                provider: 'webauthn',
                session_identifier: sessionIdentifier,
                chainId: 10,
                webauthn: {
                    id: credential.id,
                    rawId: credential.rawId,
                    signature: credential.response.signature,
                    clientDataJSON: credential.response.clientDataJSON,
                    authenticatorData: credential.response.authenticatorData,
                    realProvider: provider
                }
            }

            await fetch(`${base_url}authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.aarcApiKey
                },
                body: JSON.stringify(payload)
            });

            await axios.get(`${base_url}poll-session/farcaster/${sessionIdentifier}`, {
                headers: {
                    'x-api-key': config.aarcApiKey
                }
            }).then((res: any) => {
                const data = res.data
                if (data.code === 200) {
                    setStep('home')
                    localStorage.setItem(sessionKeys.SESSION_IDENTIFIER, sessionIdentifier)
                    localStorage.setItem(sessionKeys.SESSION_KEY, data.data.key)

                    config.callbacks.onSuccess(data)
                    setStep('home')
                    openAuthWidget()
                }

            })
        } catch (error) {
            setStep('error')
            console.error(error);
        }
    }

    const renderAuthMethod = () => {
        if (config.authMethods.includes(AuthMethod.SMS) && config.authMethods.includes(AuthMethod.EMAIL)) {
            return isEmail ? (
                <Form.Item name="email" label="Email"
                    labelAlign="right"
                    rules={[
                        { required: true, message: 'Email is required' },
                        { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                >
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Enter your email address'
                        className='h-[44px]'
                    />
                </Form.Item>
            ) : (
                <Form.Item name="phone" label="Phone Number"
                    rules={[
                        { required: true, message: 'Phone number is required' },
                        { pattern: /^\d{10}$/, message: 'Phone number should be 10 digits' }
                    ]}
                >
                    <div className="w-full flex border-[1px] rounded-md border-[#989898]">
                        <Select
                            value={countryCode}
                            className='h-[44px] max-w-[65px] border-0'
                            onChange={(e: any) => setCountryCode(e)}
                            variant="borderless"
                            options={options}
                        />
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className='h-[44px] w-full'
                            variant="borderless"
                        />
                    </div>
                </Form.Item>
            );
        }
        if (config.authMethods.includes(AuthMethod.EMAIL)) {
            return (
                <Form.Item name="email" label="Email"
                    rules={[
                        { required: true, message: 'Email is required' },
                        { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                >
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Enter your email address'
                        className='h-[44px]'
                    />
                </Form.Item>
            );
        }
        if (config.authMethods.includes(AuthMethod.SMS)) {
            return (
                <Form.Item name="phone" label="Phone Number"
                    rules={[
                        { required: true, message: 'Phone number is required' },
                        { pattern: /^\d{10}$/, message: 'Phone number should be 10 digits' }
                    ]}
                >
                    <div className="w-full flex border-[1px] rounded-md border-[#989898]">
                        <Select
                            className='h-[44px] max-w-[65px] border-0'
                            variant="borderless"
                            options={options}
                        />
                        <Input
                            className='h-[44px] w-full'
                            variant="borderless"
                        />
                    </div>
                </Form.Item>
            );
        }
    };

    const renderHomeStep = () => (
        <div className="flex flex-col items-center justify-center w-full">
            <img
                className="mt-8 mb-5"
                width={100}
                src={config.appearance.logoUrl}
                style={{ filter: config.appearance.darkMode ? 'invert(1)' : 'invert(0)' }}
                alt="Logo"
            />
            <div className="w-full">
                {(authMethods.includes(AuthMethod.EMAIL) || authMethods.includes(AuthMethod.SMS)) && (
                    <>
                        <Form
                            form={form}
                            layout='vertical'
                            name="control-hooks"
                            onFinish={handleFormFinish}
                        >
                            {renderAuthMethod()}
                            {isOTPEnabled && (
                                <Form.Item
                                    name="otp"
                                    label="OTP"
                                    rules={[
                                        { required: true, message: 'OTP is required' },
                                        { len: 6, message: 'OTP should be 6 digits' }
                                    ]}
                                >
                                    <Input
                                        value={otp}
                                        onChange={(e) => setOTP(e.target.value)}
                                        placeholder='Enter OTP'
                                        className='h-[44px]'
                                    />
                                </Form.Item>
                            )}
                            <Button
                                type="primary"
                                loading={isContinueLoading}
                                className='h-[44px] w-full mb-2'
                                htmlType="submit"
                            >
                                Continue
                            </Button>
                        </Form>
                        {authMethods.includes(AuthMethod.SMS) && authMethods.includes(AuthMethod.EMAIL) && (
                            <SwitchToSMS isEmail={isEmail} setIsEmail={setIsEmail} config={config} />
                        )}
                    </>
                )}
                {authMethods.includes(AuthMethod.WALLET) && (authMethods.includes(AuthMethod.SMS) || authMethods.includes(AuthMethod.EMAIL)) && (
                    <div className="flex items-center gap-2 mt-3">
                        <div className='bg-[#E5E5E5] h-[1px] w-1/2'></div>
                        <span className='text-sm font-medium leading-5 tracking-normal text-center text-[#4B4B4B]'>OR</span>
                        <div className='bg-[#E5E5E5] h-[1px] w-1/2'></div>
                    </div>
                )}
            </div>
            {authMethods.includes(AuthMethod.WALLET) && (
                <Button
                    className={`h-[44px] w-full font-semibold text-[16px] border-1 border-[#EDEDED] flex justify-center items-center gap-3 my-3`}
                    onClick={() => setStep('wallets')}
                >
                    Continue with Wallet
                </Button>
            )}
            <OAuthSection
                setUserData={setUserData} setNewWalletAddress={setNewWalletAddress} setSessionIdentifier={setSessionIdentifier}
                setProvider={setProvider}
                setStep={setStep}
                config={config}
                setLoadingMessage={setLoadingMessage}
            />
            <div onClick={handleLoginWithPasskey} className="text-sm font-semibold leading-5 text-left  mt-4 cursor-pointer flex gap-2 items-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.3333 4.99996C10.3333 4.65874 10.2031 4.31753 9.94281 4.05719C9.68246 3.79684 9.34123 3.66667 9 3.66667M9 9C11.2091 9 13 7.20914 13 5C13 2.79086 11.2091 1 9 1C6.79086 1 5 2.79086 5 5C5 5.18245 5.01222 5.36205 5.03587 5.53802C5.07478 5.82745 5.09424 5.97217 5.08114 6.06373C5.0675 6.1591 5.05013 6.2105 5.00313 6.2946C4.958 6.37533 4.87847 6.45486 4.71942 6.61391L1.31242 10.0209C1.19712 10.1362 1.13947 10.1939 1.09824 10.2611C1.06169 10.3208 1.03475 10.3858 1.01842 10.4538C1 10.5306 1 10.6121 1 10.7752V11.9333C1 12.3067 1 12.4934 1.07266 12.636C1.13658 12.7614 1.23856 12.8634 1.36401 12.9273C1.50661 13 1.6933 13 2.06667 13H3.66667V11.6667H5V10.3333H6.33333L7.38609 9.28058C7.54514 9.12153 7.62467 9.042 7.7054 8.99687C7.7895 8.94987 7.8409 8.9325 7.93627 8.91886C8.02783 8.90576 8.17255 8.92522 8.46198 8.96413C8.63795 8.98778 8.81755 9 9 9Z" stroke="#4B4B4B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                Login with passkey</div>
        </div>
    );

    const renderErrorStep = () => (
        <div className="flex items-center flex-col">
            <Result
                status="error"
                title="Something went wrong"
                subTitle="Please try again."
            />
            <Button
                className="mx-auto"
                onClick={() => { setOTP(''); setIsOTPEnabled(false); setStep('home'); }}
            >
                Try again
            </Button>
        </div>
    );

    return (

        <Modal open={isAuthWidgetOpen} width={380}
            maskClosable={false}
            onCancel={() => openAuthWidget()}
            styles={{
                content: {
                    background: config.appearance.darkMode ? "#1A1A1A" : "#fff",
                    color: config.appearance.darkMode ? "#fff" : "#000"
                }
            }}
            footer={
                <Footer config={config} />
            } centered={true}>
            {step === 'home' && renderHomeStep()}
            {step === 'wallets' && <BrowserWallets config={config} setWalletDetails={setWalletDetails} setStep={setStep} />}
            {step === 'loading' && <Loading loadingMessage={loadingMessage} />}
            {step === 'error' && renderErrorStep()}
            {
                step == "passkey" &&
                <PasskeyComponent setLoadingMessage={setLoadingMessage} setStep={setStep} userData={userData} newWalletAddress={newWalletAddress} config={config} sessionIdentifier={sessionIdentifier} />
            }
        </Modal>

    )
}

