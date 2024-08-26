import { Button } from 'antd';
import X from '../assets/x.svg'
import google from '../assets/google.svg'
import farcaster from '../assets/farcaster.svg'
import discord from '../assets/discord.svg'
import telegram from '../assets/telegram.svg'
import { Dispatch, SetStateAction, useRef } from 'react';
import axios from 'axios';
import { SignInButton, UseCreateChannelData } from "@farcaster/auth-kit";
import { useState } from 'react';
import AuthSDK from '@aarc-xyz/auth-sdk';

import twitterdark from '../assets/twitter-dark.svg'
import Cookies from 'universal-cookie';
import { AarcAuthWidgetConfig, OAuthProvider, OauthProviderKey, PollResponse, ProviderKey, Providers, sessionKeys, step } from './types';

interface OAuthSectionProps {
    config: AarcAuthWidgetConfig,
    setStep: Dispatch<SetStateAction<step>>,
    setProvider: Dispatch<SetStateAction<ProviderKey>>,
    setLoadingMessage: Dispatch<SetStateAction<string>>,
    setSessionIdentifier: Dispatch<SetStateAction<string>>,
    setNewWalletAddress: Dispatch<SetStateAction<string>>,
    setUserData: Dispatch<SetStateAction<PollResponse | null>>
}

const btn = 'h-[44px] w-full font-semibold text-[16px] border-1 border-[#EDEDED] flex justify-center items-center gap-3'

const OAuthSection = ({ config, setStep, setProvider, setLoadingMessage, setSessionIdentifier, setNewWalletAddress, setUserData }: OAuthSectionProps) => {


    const timeElapsed = useRef(0)
    const env = config.env
    const base_url = config.urls.pollUrls[config.env]
    const [farcasterCalled, setFarcasterCalled] = useState(false)
    const cookies = new Cookies();
    const auth = new AuthSDK(config.aarcApiKey, config.chainId, env, config.urls)

    const handleLogin = async (provider: OauthProviderKey) => {
        setProvider(provider)
        setLoadingMessage(`Please log in to ${providers[provider].label} to proceed.`)
        localStorage.setItem('provider', provider)
        const session_identifier = Math.random().toString(36).substring(7);
        setStep('loading')
        setSessionIdentifier(session_identifier)
        let url;
        if (provider == "twitter") {
            url = await auth.getTwitterLoginUrl(session_identifier)
        } else {
            url = await auth.generateUrl(provider, session_identifier)
        }
        const w = window.open(url)
        const onSuccess = (res: PollResponse) => {
            setStep('passkey')
            setNewWalletAddress(res.data.wallet_address)
            setUserData(res)
            timeElapsed.current = 60
            localStorage.setItem(sessionKeys.SESSION_IDENTIFIER, session_identifier)
            cookies.set(sessionKeys.SESSION_KEY, res.data.key, { path: '/' });

        }
        const onError = () => {
            setStep('error')
        }
        await auth.pollStytchLogin(provider, session_identifier, onSuccess, onError, 60, w as Window)

    }

    const providers: Providers = {
        "google": {
            logo: google,
            label: "Google",
            name: "google"
        },
        "twitter": {
            logo: config.appearance.darkMode ? twitterdark : X,
            label: "X",
            name: "x"
        },
        "farcaster": {
            logo: farcaster,
            label: "Farcaster",
            name: "farcaster"
        },
        "discord": {
            logo: discord,
            label: "Discord",
            name: "discord"
        },
        "telegram": {
            logo: telegram,
            label: "Telegram",
            name: "telegram"
        }
    }

    type FarcasterData = {
        message: string,
        nonce: string,
        signature: string,
        pfpUrl: string
    }

    const farCasterLogin = async (data: FarcasterData) => {

        const profile = data
        setFarcasterCalled(true)

        setLoadingMessage(`Authenticating user`)
        setStep('loading')
        const session_identifier = Math.random().toString(36).substring(7);

        axios.post(`${base_url}authenticate`, {
            "provider": "farcaster",
            "session_identifier": session_identifier,
            chainId: config.chainId,
            farcaster_session: {
                message: data.message,
                nonce: data.nonce,
                domain: window.origin.split('//')[1],
                signature: data.signature,
            }
        }, {
            headers: {
                "x-api-key": config.aarcApiKey
            }
        }).then(async () => {

            await axios.get(`${base_url}poll-session/farcaster/${session_identifier}`, {
                headers: {
                    'x-api-key': config.aarcApiKey
                }
            }).then((res) => {
                const data = res.data
                if (data.code === 200) {
                    setStep('passkey')
                    setNewWalletAddress(data.data.wallet_address)
                    setUserData(data)
                    localStorage.setItem(sessionKeys.SESSION_IDENTIFIER, session_identifier)
                    cookies.set(sessionKeys.SESSION_KEY, data.data.key, { path: '/' });
                    data.data.user.profile_picture_url = profile.pfpUrl

                }

            })
        }

        ).catch(err => {
            console.log(err)
            setStep('error')
        })
    }

    const handleTelegramAuth = async () => {

        setProvider('telegram')
        setLoadingMessage(`Please log in to ${providers['telegram'].label} to proceed.`)
        localStorage.setItem('provider', 'telegram')
        const session_identifier = Math.random().toString(36).substring(7);
        setStep('loading')

        const url = await auth.generateUrl('telegram', session_identifier)

        const w = window.open(url)
        const onSuccess = (res: PollResponse) => {
            setStep('passkey')
            setNewWalletAddress(res.data.wallet_address)
            setUserData(res)
            timeElapsed.current = 60
            localStorage.setItem(sessionKeys.SESSION_IDENTIFIER, session_identifier)
            cookies.set(sessionKeys.SESSION_KEY, res.data.key, { path: '/' });

            localStorage.setItem(sessionKeys.SESSION_KEY, res.data.key)
        }
        const onError = () => {
            setStep('error')
        }
        await auth.pollStytchLogin('telegram', session_identifier, onSuccess, onError, 60, w as Window)

    }


    return (
        <div className='w-full'>
            {config.authMethods.length > 0 && config.socialAuth.length > 0 ? <div className='flex items-center gap-2'>
                <div className='bg-[#E5E5E5] h-[1px] w-1/2'></div>
                <span className='text-sm font-medium leading-5 tracking-normal text-center text-[#4B4B4B]'>OR</span>
                <div className='bg-[#E5E5E5] h-[1px] w-1/2'></div>
            </div> : <></>}
            <div className='flex flex-col gap-3 w-full py-3'>
                {
                    config.socialAuth.slice(0, config.socialAuth.length === 3 ? 3 : 2).map((provider: OAuthProvider) => {
                        if (provider == 'farcaster')
                            return <FarcasterButton type='withLabel' />
                        else if (provider == 'telegram')


                            return <Button
                                className={btn}
                                onClick={handleTelegramAuth}>
                                <img src={providers[provider].logo} />
                                Continue with {providers[provider].label}
                            </Button>

                        else
                            return <Button
                                className={btn}
                                onClick={() => handleLogin(provider)}
                            >
                                <img src={providers[provider].logo} />
                                Continue with {providers[provider].label}
                            </Button>
                    })}
            </div>
            <div className='flex gap-3'>
                {
                    config.socialAuth.length > 3 && config.socialAuth.slice(2).map((provider: OAuthProvider) => {

                        if (provider == 'farcaster')
                            return <FarcasterButton type="withOutLabel" />
                        else if (provider == 'telegram')
                            return <Button
                                className={btn}
                                onClick={handleTelegramAuth}>
                                <img src={providers[provider].logo} />
                            </Button>
                        else
                            return <Button
                                className={btn}
                                onClick={() => handleLogin(provider)}>
                                <img src={providers[provider].logo} />
                            </Button>
                    })
                }
            </div>
            <div className='hidden'>
                <SignInButton
                    onSuccess={(profile: UseCreateChannelData) => {
                        if (farcasterCalled) return
                        farCasterLogin(profile as FarcasterData)
                    }}
                    hideSignOut={true}
                />
            </div>
        </div>
    );
};


const FarcasterButton = ({ type }: { type: string }) => (
    <Button
        className={btn}
        onClick={
            () => {
                const content = document.getElementsByClassName("fc-authkit-signin-button")[0];
                const kbButtons = content.getElementsByTagName("button");
                kbButtons[0].click()
            }
        }
    >
        <img src={farcaster} />
        {type === "withLabel" && "Continue with Farcaster "}
    </Button>)

export default OAuthSection;


