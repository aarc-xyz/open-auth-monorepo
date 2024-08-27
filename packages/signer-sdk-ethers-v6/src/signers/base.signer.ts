import { Logger } from "../logger";
import { Transaction, TransactionLike, TransactionRequest } from "ethers";
import {OpenAuthConfig, BaseProps, TransactionDto, TransactionsOperationDto, SignMessageDto} from "../types";
import { SIGN_MESSAGE_ENDPOINT, SIGN_TRANSACTION_ENDPOINT } from "../constants";

export class BaseSigner {
    private readonly logger: Logger;
    private readonly apiKeyId: string;
    private readonly sessionKey: string;
    private address: string;
    private chainId: number;

    private readonly SIGN_MESSAGE_ENDPOINT: string;
    private readonly SIGN_TRANSACTION_ENDPOINT: string;

    constructor(props: BaseProps, config?: OpenAuthConfig) {
        this.logger = new Logger();
        this.apiKeyId = props.apiKeyId;
        this.sessionKey = props.sessionKey;
        this.address = props.wallet_address;
        this.chainId = props.chainId;

        this.SIGN_MESSAGE_ENDPOINT = config?.signMessageEndpoint || SIGN_MESSAGE_ENDPOINT;
        this.SIGN_TRANSACTION_ENDPOINT = config?.signTransactionEndpoint || SIGN_TRANSACTION_ENDPOINT;
    }

    async getChainId(): Promise<number> {
        return this.chainId;
    }

    async getWalletAddress(): Promise<string> {
        return this.address;
    }

    async setChainId(chainId: number): Promise<void> {
        this.chainId = chainId;
    }

    async setWalletAddress(wallet_address: string): Promise<void> {
        this.address = wallet_address;
    }

    async getMessageSigned(message: Uint8Array | string): Promise<string> {
        try {
            const signMessagePayload: SignMessageDto = {
                wallet_address: this.address,
                sessionKey: this.sessionKey,
                chainId: this.chainId,
                message: message.toString(),
            }

            const response = await fetch(this.SIGN_MESSAGE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKeyId,
                },
                body: JSON.stringify(signMessagePayload),
            });

            if (response.status !== 200) {
                const error = await response.json();
                this.logger.error(`Message Sign Request Failed: ${error.message} with reason ${error.data}`);
                throw new Error('Sign Request Failed')
            }

            const signedMessage = await response.json();
            return signedMessage.data.toString();

        } catch (error) {
            this.logger.error('Failed to sign message', error);
            throw new Error('Failed to sign message');
        }
    }

    async getTransactionSigned(transaction: TransactionRequest): Promise<string> {
        try {
            const btx: Transaction = Transaction.from(<TransactionLike<string>>transaction);

            const transactionDto: TransactionDto = {
                to: btx.to || '',
                value: transaction.value || '0x0',
                data: transaction.data || '0x',
            }

            const signTransactionPayload: TransactionsOperationDto = {
                sessionKey: this.sessionKey,
                chainId: this.chainId,
                wallet_address: this.address,
                transaction: transactionDto,
            }

            const response = await fetch(this.SIGN_TRANSACTION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKeyId,
                },
                body: JSON.stringify(signTransactionPayload, (key, value) => {
                    return typeof value === "bigint" ? '0x' + value.toString(16) : value;
                }),
            });

            if (response.status !== 200) {
                const error = await response.json();
                this.logger.error(`Request to sign transaction failed: ${error.message} with reason ${error.data}`);
                throw new Error('Request to sign transaction failed');
            }

            const signedTransaction = await response.json();
            return signedTransaction.data.toString();
        } catch (error) {
            this.logger.error('Failed to sign transaction', error);
            throw new Error('Failed to sign transaction');
        }
    }

}
