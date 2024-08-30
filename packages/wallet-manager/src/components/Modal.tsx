import { Alert, Button, Col, Modal, Result, Row, Spin, Tabs, message, Image } from 'antd'
import useWalletManager from '../hooks/useWalletManager'
import Footer from './footer'
import { useEffect, useState } from 'react'
import { getMultiChainBalances, getTransactions } from '../api/index'
import { Token } from '../types'
import SendTransaction from './SendTransaction'
import { shortenWalletAddress } from '../utils/commonFunctions'
import Deposit from './Deposit'
import AddToken from './AddToken'
import { ArrowUpOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons'
import fallback from '../assets/Placeholder.png'

export default function WalletManagerModal({ config }: any) {

    const { isWalletManagerOpen, openWalletManager } = useWalletManager()
    const [chainLogos, setChainLogos] = useState<any>(null)
    const walletAddress = config?.walletAddress
    const [step, setStep] = useState('home')
    const [tokens, setTokens] = useState<any[] | null>(null)
    const [totalBalance, setTotalBalance] = useState(0)
    const [messageApi, contextHolder] = message.useMessage();
    const isDarkMode = config?.appearance?.darkMode
    const [availbleChains, setAvailableChains] = useState<any>(null)
    const [tokenData, setTokenData] = useState<any>(null)
    const [sendTransactionData, setSendTransactionData] = useState<any>(null)
    const [loading, setLoading] = useState(false)


    useEffect(() => {

        setLoading(true)
        let tokens = localStorage.getItem('wallet_manager_tokens')
        let parsedTokens = []
        if (tokens) {
            parsedTokens = JSON.parse(tokens)
        }

        getMultiChainBalances(walletAddress).then((data: any) => {

            setTotalBalance(getTotalBalance(data.data))

            setAvailableChains(extractChains(data.data.balances))
            setTokens(getTokenInfo(data.data).concat(parsedTokens))

            setTokenData(data.data.balances)
            setChainLogos(getChainLogos(data.data))
            setLoading(false)

        }
        )
    }, [isWalletManagerOpen])

    const tabs = [
        {
            title: 'Tokens',
            key: '1',
            content: <TokensTab tokens={tokens} loading={loading} />,
        },
        {
            title: 'Activity',
            key: '2',
            content: <ActivityTab config={config} />
        },
    ]

    const renderTitle = () => {
        switch (step) {
            case 'home':
                return 'Wallet manager'
            case 'send':
                return 'Send to'
            case 'deposit':
                return 'Deposit'
            case 'deposit-confirm':
                return 'Deposit'
            case 'add-token':
                return 'Import token'
            case 'confirm-transaction':
                return 'Confirm Transaction'
            default:
                return 'Wallet manager'
        }
    }

    return (
        <Modal className='h-[600px]' width={440} open={isWalletManagerOpen} footer={false} onCancel={openWalletManager}>
            {contextHolder}
            <div className='flex flex-col'>
                <p className='font-semibold text-[16px] text-center '>{renderTitle()}</p>
                <div className='flex flex-col gap-[20px]  mt-[34px]'>
                    {step == 'add-token' ? <></> : <div className={isDarkMode ? 'bg-[#242424]' : 'p-2 border-[#ededed] bg-[#FBFBFB] border-[1px] rounded-[1rem]'}>
                        <div className={isDarkMode ? 'bg-[#2D2D2D] rounded-[8px] flex flex-col border-[#F6F6F6] border-[1px]' : 'bg-[white] rounded-[8px] flex flex-col border-[#F6F6F6] border-[1px]'}>
                            <div className='flex justify-between p-3 items-center border-b-[1px] border-[#F6F6F6]'>
                                <div className='flex gap-3 items-center'>

                                    <Image preview={false}
                                        fallback={"https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg"} height={42} width={42} className=' opacity-[0.8] rounded-full'
                                        src={config.profileURL}
                                    // src="https://lh3.googleusercontent.com/a/ACg8ocJgvyoM8H1Ff-fk3OJSd0PRkfFx9vYwXkOkE_VGk_L5wefi4PYo=s96-c"
                                    />
                                    <p className='font-semibold text-[16px]'>{shortenWalletAddress(config.walletAddress)}</p>
                                </div>
                                <Button className='h-[36px] min-w-[36px] flex justify-center items-center '
                                    onClick={() => {

                                        navigator.clipboard.writeText(config.walletAddress)
                                        messageApi.success('Wallet address copied to clipboard')
                                    }
                                    }
                                    icon={
                                        <CopyOutlined />
                                    }></Button>
                            </div>
                            {step == 'home' && <Row className='p-3 justify-between items-center'>
                                <Col>
                                    <p className='font-semibold'>
                                        Total Balance
                                    </p>
                                    <p className='font-semibold text-[18px]'>
                                        ${totalBalance}
                                    </p>
                                </Col>
                                <Col>
                                    <div className=' inner'>
                                        {
                                            chainLogos && chainLogos.map((chain: any) => {
                                                return <img className='rounded-full tile-inner' src={chain} alt="knmknk" />

                                            })
                                        }
                                    </div>
                                </Col>
                            </Row>}
                        </div>
                    </div>}
                    {step == 'home' && <><Row className='gap-[14px]'>
                        <Button
                            className='flex-[1]  h-[40px] '
                            type='primary'

                            icon={
                                <ArrowUpOutlined style={{
                                    color: config.appearance.color
                                }} />
                            }
                            onClick={() => setStep('send')}
                        >Send</Button>

                        <Button
                            className=' h-[40px] !w-[40px]'
                            onClick={() => setStep('add-token')}
                            icon={
                                <PlusOutlined />
                            }></Button>
                    </Row>
                        <Col className='w-full'>
                            <Tabs
                                defaultActiveKey="1"
                                centered
                                items={tabs.map((_, i) => {
                                    const id = String(i + 1);
                                    return {
                                        label: _.title,
                                        key: id,
                                        children: _.content,
                                    };
                                })}
                            />
                        </Col></>}
                    {step == 'send' &&
                        <SendTransaction
                            sendTransactionData={sendTransactionData}
                            setSendTransactionData={setSendTransactionData}
                            availbleChains={availbleChains} tokensData={tokenData} step={step} setStep={setStep} config={config} />
                    }
                    {
                        step == 'confirm-transaction' &&
                        <SendTransaction
                            sendTransactionData={sendTransactionData}
                            setSendTransactionData={setSendTransactionData}
                            availbleChains={availbleChains} tokensData={tokenData} step={step} setStep={setStep} config={config} />


                    }
                    {
                        (step == 'deposit' || step == 'deposit-confirm') && <Deposit setStep={setStep} step={step} />
                    }

                    {
                        step == 'success' && <Result status='success' title="Transaction successful" />
                    }
                    {
                        step == 'error' && <Result status='error' title="Transaction failed" />
                    }
                    {
                        step == 'add-token' && <AddToken setTokens={setTokens} tokensState={tokens} config={config} step={step} setStep={setStep} />
                    }
                </div>
            </div>
            <Footer isDarkMode={isDarkMode} />
        </Modal>
    )
}

function TokensTab({ tokens, loading }: any) {

    if (loading) <div className='flex justify-center'> <Spin /> </div>

    return (
        <div className='max-h-[205px] overflow-auto'>
            {
                (tokens && tokens.length > 0 ?
                    tokens.map((token: Token, index: number) => {

                        return (
                            <div key={index} className='flex flex-col'>
                                <div className='flex justify-between px-2 py-[3px]'>
                                    <div className='flex gap-3 items-center'>
                                        <div className='relative'>
                                            {token.tokenLogo ? <Image
                                                fallback={fallback}
                                                className='rounded-full' height={32} width={32} src={token.tokenLogo} />
                                                : <div className='h-[32px] w-[32px] bg-[#B5B5B5] text-[white] flex justify-center items-center rounded-full'>{token.tokenName[0]}</div>
                                            }
                                            <img className='absolute right-0 bottom-0 border-[1px] border-[#FFFFFF] rounded-full' height={12} width={12} src={token.chainLogo} />
                                        </div>
                                        <div className='font-semibold text-[16px]'>
                                            {token.tokenSymbol}
                                        </div>
                                    </div>
                                    <div className='flex flex-col text-right'>
                                        <div className='font-semibold'>{token.balance}{" "}{token.tokenSymbol}</div>
                                        <div className='text-[12px] font-light'>{token.usdPrice}{" "}USD</div>
                                    </div>
                                </div>
                                <div className='h-[1px] bg-[#F6F6F6] mb-2'></div>
                            </div>
                        )
                    }) :
                    (<><Alert showIcon className='mt-3' type='info' message="No tokens found" /></>))

            }
        </div>
    )
}

function ActivityTab({ config }: { config: any }) {

    const [transactions, setTransactions] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        getTransactions(config.walletAddress).then((data) => {
            setTransactions(data.data)
            setLoading(false)
        }
        )
    }, [])

    const status: any = {
        "SUCCESS": "Confirmed",
        "FAILED": "Failed"
    }

    const txSymbol: any = {
        "SUCCESS": <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 13L13 1M13 1H5M13 1V9" stroke="#008000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>,
        "FAILED": <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 13H9M1 13V5" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

    }

    if (loading) {
        return <div className='flex justify-center items-center h-[200px]'> <Spin /></div>
    }

    return (
        <div className='max-h-[205px] overflow-auto'>

            {
                transactions && transactions.length > 0 ? transactions.map((tx: any, index: any) => {
                    return (
                        <div className='flex flex-col gap-2' key={index}>
                            <div className='flex justify-between px-2 py-[3px]'>
                                <div className='flex gap-3 items-center'>
                                    <div className='relative'>
                                        <div className='w-[40px] h-[40px] border-[#0080001A] bg-[#0080000D] rounded-full flex justify-center items-center border-[1px] '>
                                            {txSymbol[tx.status]}
                                        </div>
                                        <img className='absolute right-0 bottom-0 border-[1px] border-[#FFFFFF] rounded-full' height={12} width={12} src={tx?.tokenTransfer?.logoURI} />
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='font-semibold'>Send {tx?.tokenTransfer?.name}</p>
                                        <p className='text-[#008000] text-[14px] font-semibold'>{status[tx.status]}</p>
                                    </div>
                                </div>
                                <div className='flex flex-col text-right items-center justify-center'>
                                    {/* <div>{tx?.amountTransferred} {tx?.tokenTransfer?.symbol}</div>
                                    <div>1.59 USD</div> */}
                                    <p className='text-[#008000] text-[14px] font-semibold'>{status[tx.status]}</p>

                                </div>
                            </div>
                            <div className='h-[1px] bg-[#F6F6F6] mb-2'></div>
                        </div>
                    )
                }) : <Alert showIcon className='mt-3' type='info' message="No transactions here yet" />
            }
        </div>
    )
}

function getChainLogos(data: any) {
    const chainLogos = [];
    for (const chainId in data.balances) {
        if (data.balances.hasOwnProperty(chainId)) {
            chainLogos.push(data.balances[chainId].logo);
        }
    }
    return chainLogos;
}

function getTotalBalance(data: any): number {
    let totalBalance: number = 0;
    for (const chainId in data.balances) {
        if (data.balances.hasOwnProperty(chainId)) {
            const chain = data.balances[chainId];
            for (const token of chain.balances) {
                const balance: number = parseFloat(token.balance) / Math.pow(10, token.decimals);
                totalBalance += balance * token.usd_price;
            }
        }
    }
    return parseInt(totalBalance.toFixed(2));
}


function getTokenInfo(data: any) {
    const tokenInfo = [];
    for (const chainId in data.balances) {
        if (data.balances.hasOwnProperty(chainId)) {
            const chain = data.balances[chainId];
            const chainLogo = chain.logo;
            const chainName = chain.balances[0].name;

            for (const token of chain.balances) {
                const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
                const tokenObj: Token = {
                    chainLogo: chainLogo,
                    chainName: chainName,
                    tokenName: token.name,
                    tokenLogo: token.logo,
                    // the usd price is the value of the tokens in USD
                    usdPrice: parseFloat((token.usd_price * balance).toFixed(2)),
                    balance: balance.toFixed(2),
                    tokenSymbol: token.symbol,
                    decimals: token.decimals
                };
                tokenInfo.push(tokenObj);
            }
        }
    }
    return tokenInfo;
}

function extractChains(balances: any) {
    const chains: any = {};

    // Iterate through each balance
    for (const chainId in balances) {
        const chain = balances[chainId];

        // If chain doesn't exist in chains object, add it
        if (!chains[chainId]) {
            chains[chainId] = {
                id: chainId,
                name: chain.logo.split('/').pop().split('.')[0], // Extract name from logo URL
                logo: chain.logo
            };
        }
    }

    // Convert chains object to array
    const chainsArray = Object.values(chains);

    return chainsArray;
}
