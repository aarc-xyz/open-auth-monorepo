import { Button, Form, Input, Select } from 'antd'
import { useEffect, useState } from 'react'
import { createPublicClient } from 'viem'
import { getSupportedChains } from '../api'
import { Token } from '../types';
import { http } from '@wagmi/core'
import { mainnet, polygon, arbitrum, optimism, bsc, polygonZkEvm, base, avalanche, linea, gnosis, fantom, moonriver, moonbeam, fuse, okc, boba, aurora, metis, mantle, zora, blast, scroll, mode } from '@wagmi/core/chains'

const chains = [mainnet, arbitrum, optimism, polygon, bsc, polygonZkEvm, base, avalanche, linea, gnosis, fantom, moonriver, moonbeam, fuse, okc, boba, aurora, metis, mantle, zora, blast, scroll, mode];

export default function AddToken({ tokensState, setTokens, config, step, setStep }: any) {

    const [internalStep, setInternalStep] = useState('add-token')
    const [supportedChains, setSupportedChains] = useState<any[]>([])
    const [publicClient, setPublicClient] = useState<any>(null)
    const [tokenAddress, setTokenAddress] = useState<any>("")
    const [tokenBalance, setTokenBalance] = useState<any>(0)
    const [tokenSymbol, setTokenSymbol] = useState<any>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [newToken, setNewToken] = useState<Token>({
        tokenSymbol: tokenSymbol, // 
        chainLogo: "",
        chainName: '',
        tokenName: '', // 
        tokenLogo: '',
        usdPrice: 0, // 
        balance: '', // 
        decimals: 0 // 
    })
    const [errorMessage, setErrorMessage] = useState("Make sure you trust a token before you add it.")

    useEffect(() => {
        getChains()
    }, [])

    const getChains = async () => {
        getSupportedChains(config.apiKey).then((data: any) => {
            setSupportedChains(data.data || [])
        }).catch(() => {
            setSupportedChains([])
        })

    }


    const getTokenSymbol = async () => {

        const tokenSymbol = await publicClient.readContract({
            address: tokenAddress,
            abi: [
                {
                    name: 'symbol',
                    type: 'function',
                    outputs: [{ name: '', type: 'string' }],
                },
            ],
            functionName: 'symbol',
        });

        return tokenSymbol
    }


    const handleChainChange = (value: any) => {
        const _chain = chains.find((chain) => chain.id == value)
        const chain = supportedChains.find((chain) => chain.chainId == value)
        setNewToken({
            ...newToken,
            chainLogo: chain.logoURI,
            chainName: chain.name,

        })
        const _publicClient = createPublicClient({
            chain: _chain,
            transport: http(),
        })


        setPublicClient(_publicClient)

    }

    const handleNext = async () => {

        try {
            setLoading(true)
            const balance: any = await publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        constant: true,
                        inputs: [
                            {
                                name: "_owner",
                                type: "address",
                            },
                        ],
                        name: "balanceOf",
                        outputs: [
                            {
                                name: "balance",
                                type: "uint256",
                            },
                        ],
                        payable: false,
                        stateMutability: "view",
                        type: "function",
                    },
                ],
                functionName: 'balanceOf',
                args: [config.walletAddress],
            })

            const decimals = await publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        type: "function",
                        constant: true,
                        payable: false,
                        name: "decimals",
                        stateMutability: "view",
                        inputs: [],
                        outputs: [
                            {
                                "type": "uint8"
                            }
                        ]
                    }],
                functionName: 'decimals',
                args: []
            })

            setInternalStep('confirm-add')
            const _tokenSymbol = await getTokenSymbol()
            setTokenSymbol(_tokenSymbol)
            const normalBalance = parseFloat(balance) / (Math.pow(10, 6))
            setTokenBalance(normalBalance.toFixed(2))
            setNewToken({
                ...newToken,
                decimals: decimals,
                tokenName: _tokenSymbol,
                tokenSymbol: _tokenSymbol,
                balance: normalBalance.toFixed(2)
            })
            setLoading(false)

        } catch (err: any) {
            console.log("Error while adding token ", err.message)
            setErrorMessage("Token address not found!")
            setLoading(false)

        }


    }

    const handleConfirm = async () => {

        // get the tokens from localstorage 
        let tokens = localStorage.getItem('wallet_manager_tokens')
        const _newToken: Token = {
            ...newToken,
            tokenSymbol: tokenSymbol,
        }
        if (!tokens) {
            localStorage.setItem('wallet_manager_tokens', JSON.stringify([newToken]))
            setTokens([...tokensState, _newToken])

        } else {
            let parsedTokens = JSON.parse(tokens)
            parsedTokens.push(_newToken)
            localStorage.setItem('wallet_manager_tokens', JSON.stringify(parsedTokens))
            setTokens([...tokensState].concat(parsedTokens))
        }

        setStep('home')

        // localStorage.setItem('tokens', [])
    }

    if (internalStep === 'add-token') {

        return (
            <div>
                <div className='h-[48px] bg-[#FDB0221A] rounded-md p-[14px] flex justify-center items-center gap-2 mb-[14px] border-[1px] border-[#FDB0224D]'>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.25 4.85C1.25 3.58988 1.25 2.95982 1.49524 2.47852C1.71095 2.05516 2.05516 1.71095 2.47852 1.49524C2.95982 1.25 3.58988 1.25 4.85 1.25H11.15C12.4101 1.25 13.0402 1.25 13.5215 1.49524C13.9448 1.71095 14.289 2.05516 14.5048 2.47852C14.75 2.95982 14.75 3.58988 14.75 4.85V9.125C14.75 10.1734 14.75 10.6976 14.5787 11.111C14.3504 11.6624 13.9124 12.1004 13.361 12.3287C12.9476 12.5 12.4234 12.5 11.375 12.5C11.0086 12.5 10.8253 12.5 10.6554 12.5401C10.4287 12.5936 10.2177 12.6992 10.0389 12.8484C9.90479 12.9603 9.79486 13.1069 9.575 13.4L8.48 14.86C8.31716 15.0771 8.23574 15.1857 8.13593 15.2245C8.0485 15.2585 7.9515 15.2585 7.86407 15.2245C7.76426 15.1857 7.68284 15.0771 7.52 14.86L6.425 13.4C6.20514 13.1069 6.09521 12.9603 5.96112 12.8484C5.78234 12.6992 5.57127 12.5936 5.34463 12.5401C5.17465 12.5 4.99143 12.5 4.625 12.5C3.57663 12.5 3.05245 12.5 2.63896 12.3287C2.08765 12.1004 1.64963 11.6624 1.42127 11.111C1.25 10.6976 1.25 10.1734 1.25 9.125V4.85Z" fill="#FDB022" fill-opacity="0.4" />
                        <path d="M8 6.875V4.25M8 9.5H8.0075M6.425 13.4L7.52 14.86C7.68284 15.0771 7.76426 15.1857 7.86407 15.2245C7.9515 15.2585 8.0485 15.2585 8.13593 15.2245C8.23574 15.1857 8.31716 15.0771 8.48 14.86L9.575 13.4C9.79486 13.1069 9.90479 12.9603 10.0389 12.8484C10.2177 12.6992 10.4287 12.5936 10.6554 12.5401C10.8253 12.5 11.0086 12.5 11.375 12.5C12.4234 12.5 12.9476 12.5 13.361 12.3287C13.9124 12.1004 14.3504 11.6624 14.5787 11.111C14.75 10.6976 14.75 10.1734 14.75 9.125V4.85C14.75 3.58988 14.75 2.95982 14.5048 2.47852C14.289 2.05516 13.9448 1.71095 13.5215 1.49524C13.0402 1.25 12.4101 1.25 11.15 1.25H4.85C3.58988 1.25 2.95982 1.25 2.47852 1.49524C2.05516 1.71095 1.71095 2.05516 1.49524 2.47852C1.25 2.95982 1.25 3.58988 1.25 4.85V9.125C1.25 10.1734 1.25 10.6976 1.42127 11.111C1.64963 11.6624 2.08765 12.1004 2.63896 12.3287C3.05245 12.5 3.57663 12.5 4.625 12.5C4.99143 12.5 5.17465 12.5 5.34463 12.5401C5.57127 12.5936 5.78234 12.6992 5.96112 12.8484C6.09521 12.9603 6.20514 13.1069 6.425 13.4Z" stroke="#2D2D2D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <p>{errorMessage}</p>
                </div>
                <Form layout='vertical' disabled={step === 'deposit-confirm' ? true : false} className='flex flex-col gap-[14px]'>
                    <Form.Item label="Chain">
                        <Select
                            className='h-[44px] border-[#989898] border-[1px] rounded-md'
                            showSearch
                            variant="borderless"
                            // style={{ width: 200 }}
                            placeholder="Search to Select"
                            optionFilterProp="children"
                            filterOption={(input, option): any => (option?.name.toLowerCase()).includes(input)}
                            filterSort={(optionA, optionB) =>
                                (optionA?.name).toLowerCase().localeCompare((optionB?.name).toLowerCase())
                            }
                            onChange={handleChainChange}
                            options={
                                supportedChains.map((chain) => {

                                    return {
                                        value: chain.chainId,
                                        name: chain.name,
                                        label: <div className='flex gap-2 h-[44px] items-center'>
                                            <img className='rounded-full' height={24} width={24}

                                                src={chain.logoURI} />
                                            <p>{chain.name}</p>
                                        </div>
                                    }

                                }
                                )
                            }
                        />

                    </Form.Item>
                    <Form.Item label='Token address'>
                        <Input
                            onChange={(e) => setTokenAddress(e.target.value)}
                            className='h-[44px] border-[#989898] border-[1px]' placeholder='0x7ef61A717a5A088Ccc5d52c62e23a64d26CEC533' />
                    </Form.Item>
                    <div className='flex gap-4'>
                        <Button onClick={() => setStep('home')} className='h-[44px] w-[140px]'>Cancel</Button>
                        <Button loading={loading} onClick={handleNext} className='h-[44px] w-full' type='primary'>Next</Button>
                    </div>
                </Form>
            </div>
        )

    }


    return (
        <div className='h-[400px] relative'>
            <p className='text-center mb-[28px] font-semibold'>Are you sure you want to import this token?</p>
            <div className='flex bg-[#FBFBFB] rounded-sm p-[14px] gap-4 items-center'>
                <div>
                    <div className='h-[32px] w-[32px] bg-[#B5B5B5] text-[white] flex justify-center items-center rounded-full'>{tokenSymbol[0]}</div>
                </div>
                <div className='flex flex-col'>
                    <p>{tokenSymbol}</p>
                    <p>{tokenBalance}{" "}{tokenSymbol}</p>
                </div>
            </div>
            <div className='flex gap-4 absolute w-full bottom-3'>
                <Button onClick={() => setInternalStep('add-token')} className='h-[44px] w-[140px]'>Cancel</Button>
                <Button onClick={handleConfirm} className='h-[44px] w-full' type='primary'>Confirm</Button>
            </div>
        </div>
    )

}