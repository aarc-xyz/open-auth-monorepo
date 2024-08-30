import { BigNumberish } from "ethers";

export type OpenAuthConfig = {
    baseUrl: string;
}

export type BaseProps = {
    wallet_address: string;
    sessionKey: string;
    chainId: number;
}

export type TransactionDto = {
    to: string;
    value?: BigNumberish;
    data?: string;
}

export type SignerDto = {
    wallet_address: string;
    sessionKey: string;
    chainId: number;
}

export type SignMessageDto = {
    message: string;
} & SignerDto;

export type TransactionsOperationDto = {
    transaction: TransactionDto;
} & SignerDto;