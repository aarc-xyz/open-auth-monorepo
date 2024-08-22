import { Button, Form, Input, Select, message } from 'antd'
import { useState } from 'react'
import { sendTransaction } from '../api';

export default function SendTransaction({ availbleChains, tokensData, step, setStep, config, setSendTransactionData, sendTransactionData }: any) {

    const [selectedChain, setSelectedChain] = useState(1)
    const [form] = Form.useForm();
    const [tokens, setTokens] = useState<any[]>([])
    const [selectedToken, setSelectedToken] = useState<any>(null)
    const [amount, setAmount] = useState<any>(0.00)
    let values: any = {}


    if (step == 'confirm-transaction')
        return (
            <div className='flex flex-col gap-[14px]'>
                <div className='flex flex-col gap-2'>
                    <p className='font-light text-[14px] leading-[20px]'>
                        Receiver’s address
                    </p>
                    <div className='bg-[#FBFBFB] py-[10px] px-[14px] border-[1px] border-[#FBFBFB] rounded-md'>
                        {sendTransactionData.receiversAddress}
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <p className='font-light text-[14px] leading-[20px]'>
                        Network
                    </p>
                    <div className='bg-[#FBFBFB] py-[10px] px-[14px] border-[1px] border-[#FBFBFB] rounded-md flex gap-2 items-center'>
                        <img height={20} width={20} src={availbleChains.find((chain: any) => chain.id == selectedChain).logo} />
                        {availbleChains.find((chain: any) => chain.id == selectedChain).name}
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <p className='font-light text-[14px] leading-[20px]'>
                        Amount
                    </p>
                    <div className='bg-[#FBFBFB] py-[10px] px-[14px] border-[1px] border-[#FBFBFB] rounded-md flex justify-between items-center'>
                        <div className='flex gap-2 items-center'>
                            <img height={20} width={20} src="https://s3-alpha-sig.figma.com/img/6b96/e07e/ea8f224aa4db7ce6ac4494a9d615af59?Expires=1715558400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=llODevBjjbPhx9PrRImCAK3mQkLnc~pjgScEwZEl~B9hfIVR3BLmdBH-QEieSQUv12PoiyyIyaiLZTJkfYVQyIgOKsnocvfpgTl2oi-PiZQ0nZfvv~rJ-HeMDfyN6Wd3lmBbNdUbI7SstvIvZN7TaWsmAULi5WSV1Mg9iTQ1UbMgnjImHvmr02m7UJaxhC69mZlc5laSBjPjEFFAphiBoSI5FuUJMpOp-rwqKw4rDYUPhFDNtqxr8oswp1AXSLa2ypK~-jRaQAmLvYT8K6-L825T8W9btjjlOOCuGcH7xd-JqDOTThIzF92iK1eBUbjgnOZ8Dhc4RSd2-G8Bbt0Qgg__" />
                            {sendTransactionData.amount}
                        </div>
                        <div>
                            {sendTransactionData.usd.toFixed(2)} {" USD"}
                        </div>
                    </div>
                </div>

                <div className='flex gap-4'>
                    <Button onClick={() => setStep('send')} className='h-[44px] w-[140px]'>Back</Button>
                    <Button className='h-[44px] w-full' type='primary'
                        onClick={completeTransaction}
                    >Confirm</Button>
                </div>
            </div>
        )

    const handleTokenChange = (value: any) => {
        console.log(value)
        setSelectedToken(value)
        // now from the tokens Data we can get the token details

        tokensData.forEach((token: any) => {
            if (token.address == value) {
                console.log(token)
            }
        }
        )

    }

    const handleChainChange = (value: any) => {
        console.log(value)
        setSelectedChain(value)
        console.log(getTokensByChain(tokensData, value), "these are token")
        setTokens(getTokensByChain(tokensData, value))
        setSelectedToken(null)

        // now from the tokens Data we need to get the all the tokens for the selected chain

    }

    function getTokensByChain(balances: any, chainId: any) {
        const tokens: any = [];

        // Check if chainId exists in balances
        if (balances.hasOwnProperty(chainId)) {
            const chain = balances[chainId];

            // Iterate through balances of the specified chain
            chain.balances.forEach((balance: any) => {
                tokens.push({
                    name: balance.name,
                    symbol: balance.symbol,
                    tokenAddress: balance.token_address,
                    logo: balance.logo,
                    balance: balance.balance,
                    usdPrice: balance.usd_price,
                    decimals: balance.decimals,
                });
            });
        }

        return tokens;
    }

    const onFinish = (values: any) => {
        values = values
        values.usd = values.amount * tokens.find((token) => token.tokenAddress == selectedToken).usdPrice
        setSendTransactionData(values)
        setStep('confirm-transaction')
    }

    function completeTransaction() {

        const sessionKey: string = localStorage.getItem('sessionKey') || ''
        const session_identifier: string = localStorage.getItem('session_identifier') || ''

        if (session_identifier.length == 0 || sessionKey.length == 0) {
            message.error("Session not found.Please login again")
            return;
        }

        const tx = {
            from: config.walletAddress,
            to: values.receiversAddress,
            value: values.amount.toHex()
        }

        sendTransaction(config.apiKey, tx, selectedChain, sessionKey, session_identifier).then((data) => {
            console.log(data, "data")
            setStep('success')
        }).catch(err => {
            console.log(err)
            setStep('error')
        })
    }


    return (
        <div>
            <Form
                form={form}
                layout='vertical'
                onFinish={onFinish}
            >
                <Form.Item
                    name={"receiversAddress"}
                    rules={[{ required: true, message: 'Please input the receiver’s address!' }]}
                    label='Receiver’s address'>
                    <Input className='h-[44px] border-[#989898] border-[1px]' placeholder='0x7ef61A717a5A088Ccc5d52c62e23a64d26CEC533' />
                </Form.Item>
                <Form.Item label="Network"
                    name="network"
                    rules={[{
                        required: true, message: 'Please select a network'
                    }]}
                >
                    <Select
                        className='h-[44px] border-[#989898] border-[1px] rounded-md'
                        showSearch
                        variant="borderless"

                        // style={{ width: 200 }}
                        onChange={(value) => handleChainChange(value)}
                        placeholder="Search to Select"
                        optionFilterProp="children"
                        filterOption={(input, option): any => {

                            //@ts-ignore
                            return (option.name.toLowerCase()).includes(input.toLowerCase());

                        }}
                        filterSort={(optionA, optionB) =>
                            (optionA?.name ?? '').toLowerCase().localeCompare((optionB?.name ?? '').toLowerCase())
                        }
                        options={
                            availbleChains ? availbleChains.map((chain: any) => ({
                                value: chain.id,
                                name: chain.name,
                                label: <div className='flex gap-2 h-[44px] items-center'>
                                    <img height={24} width={24}

                                        src={chain.logo} />
                                    <p>{chain.name}</p>
                                </div>
                            })) : []
                        }


                    />

                </Form.Item>
                <div className='flex w-full relative justify-between gap-[14px]'>
                    <Form.Item label="Token" className='w-[154px]'
                        name="token"
                        rules={[{ required: true, message: 'Please select a token!' }]}

                    >
                        <Select
                            className='h-[44px] w-[154px] border-[#989898] border-[1px] rounded-md'
                            showSearch
                            value={selectedToken}
                            variant="borderless"
                            placeholder="Search to Select"
                            optionFilterProp="children"
                            onChange={handleTokenChange}
                            filterOption={(input, option) =>
                                (option?.name.toLowerCase()).includes(input.toLowerCase())
                            }
                            options={

                                tokens.map((token) => ({
                                    value: token.tokenAddress,
                                    name: token.symbol,
                                    label: <div className='flex gap-2 h-[44px] items-center'>
                                        <img height={24} width={24}

                                            src={token.logo} />
                                        <p>{token.symbol}</p>
                                    </div>
                                }))

                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="amount"
                        rules={[{ required: true, message: 'Please input the amount!' },
                        // the amount should be a integer or float
                        {
                            validator: async (_, value) => {
                                if (value && !/^\d+(\.\d+)?$/.test(value)) {
                                    return Promise.reject('Please input a valid number!');
                                }
                                return Promise.resolve();
                            }
                        },

                        // the amount must be greater than 1 / 10^decimals
                        {
                            validator: async (_, value) => {
                                if (value) {
                                    const selectedTokenData = tokens.find((token) => token.tokenAddress === selectedToken);
                                    const minAmount = 1 / Math.pow(10, selectedTokenData.decimals);
                                    if (parseFloat(value) < minAmount) {
                                        return Promise.reject(`Lower than minimum amount`);
                                    }
                                }
                                return Promise.resolve();
                            }
                        },




                        // the amount should not be greater than the balance of the selected token
                        {
                            validator: async (_, value) => {

                                // Get the selected token balance from selectedToken id and tokens array
                                console.log(selectedToken, "selectedToken")
                                const selectedTokenData = tokens.find((token) => token.tokenAddress === selectedToken);
                                console.log(selectedTokenData, "selectedTokenData")
                                const selectedTokenBalance = parseFloat(selectedTokenData.balance) / Math.pow(10, selectedTokenData.decimals);
                                console.log(selectedTokenBalance, "selectedTokenBalance")

                                // Get the selected token balance

                                // Check if the entered amount is greater than the balance of the selected token
                                if (value && parseFloat(value) > selectedTokenBalance) {
                                    return Promise.reject('Insufficient balance!');
                                }
                                return Promise.resolve();
                            }
                        }

                        ]}
                        label='Amount' className='w-full'>
                        <Input
                            onChange={(e) => setAmount(e.target.value)}
                            className='h-[44px] border-[#989898] border-[1px] flex-1 w-full' placeholder='0' />
                    </Form.Item>
                    <div className='flex absolute justify-end top-[78px] right-0'>
                        {
                            selectedToken ?
                                (amount * tokens.find((token) => token.tokenAddress == selectedToken).usdPrice).toFixed(2) + " USD" : "0.00 USD"}
                    </div>
                </div>
                <div className='flex gap-4 mt-3'>
                    <Button onClick={() => setStep('home')} className='h-[44px] w-[140px]'>Cancel</Button>
                    <Button htmlType='submit' className='h-[44px] w-full' type='primary'>Next</Button>
                </div>
            </Form>

        </div>
    )

}