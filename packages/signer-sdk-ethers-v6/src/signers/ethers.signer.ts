import {
    Signer,
    Provider,
    JsonRpcProvider,
    BlockTag,
    TransactionRequest,
    TransactionLike,
    Transaction,
    TypedDataEncoder,
    getBigInt,
    resolveProperties,
    getAddress,
    resolveAddress, TransactionResponse
} from "ethers";
import { BaseSigner } from "./base.signer";
import { checkProvider, isSignedTransaction, populateAndResolve } from "../helper";
import { BaseProps, OpenAuthConfig } from "../types";


export class EthersSigner
    extends BaseSigner
    implements Signer
{

    provider: Provider | null;

    private manualGasPrice?: bigint;
    private manualGasLimit?: bigint;

    constructor(rpcUrl: string | null, props: BaseProps, config?: OpenAuthConfig) {
        super(props, config);
        if (rpcUrl) {
            this.provider = new JsonRpcProvider(rpcUrl);
        } else {
            this.provider = null;
        }
    }

    // ------------------------------ Abstract methods ------------------------------ //
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connect(provider: Provider | null): never {
        // Connect is not supported for this signer since it is a standalone signer
        throw new Error('connect method not supported, to change Provider use setProvider() method')
    }

    async getAddress(): Promise<string> {
        return this.getWalletAddress();
    }

    async getNonce(blockTag?: BlockTag): Promise<number> {
        return await checkProvider(this, 'getNonce').getTransactionCount(this.getAddress(), blockTag);
    }

    async estimateGas(tx: TransactionRequest): Promise<bigint> {
        return await checkProvider(this, 'estimateGas').estimateGas(tx);
    }

    async resolveName(name: string): Promise<string | null> {
        return await checkProvider(this, 'resolveName').resolveName(name);
    }

    async populateCall(tx: TransactionRequest): Promise<TransactionLike<string>> {
        return await populateAndResolve(this, tx);
    }

    async call(tx: TransactionRequest): Promise<string> {
        return checkProvider(this, 'call').call(await this.populateCall(tx));
    }

    async populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>> {
        const provider = checkProvider(this, 'populateTransaction');
        const populatedTx = await populateAndResolve(this, tx);

        if (populatedTx.nonce == null) {
            populatedTx.nonce = await this.getNonce('pending');
        }

        if (populatedTx.gasLimit == null) {
            populatedTx.gasLimit = this.manualGasLimit || await this.estimateGas(populatedTx);
        }

        const network = await provider.getNetwork();
        if (populatedTx.chainId != null) {
            const chainId = getBigInt(populatedTx.chainId);
            if (chainId !== BigInt(network.chainId)) {
                throw new Error(`chainId mismatch, expected ${network.chainId} but got ${chainId}`);
            }
        } else {
            populatedTx.chainId = network.chainId;
        }

        const hasEip1559 = (populatedTx.maxFeePerGas != null || populatedTx.maxPriorityFeePerGas != null);
        if (populatedTx.gasPrice != null && (populatedTx.type === 2 || hasEip1559)) {
            throw new Error(`eip-1559 transaction do not support gasPrice, tx: ${tx}`);
        } else if (populatedTx.type === 0 || populatedTx.type === 1) {
            throw new Error(`pre-eip-1559 transaction do not support maxFeePerGas/maxPriorityFeePerGas, tx: ${tx}`);
        }

        if ((populatedTx.type === 2 || populatedTx.type == null) && (populatedTx.maxFeePerGas == null && populatedTx.maxPriorityFeePerGas == null)) {
            populatedTx.type = 2;
        } else if (populatedTx.type === 0 || populatedTx.type === 1) {
            const feeData = await provider.getFeeData();
            if (feeData.gasPrice != null) {
                throw new Error("Network does not support gasPrice");
            }

            if (populatedTx.gasPrice == null) {
                populatedTx.gasPrice = feeData.gasPrice;
            }
        } else {
            const feeData = await provider.getFeeData();

            if (populatedTx.type == null) {
                if (feeData.maxFeePerGas != null && feeData.maxPriorityFeePerGas != null) {
                    populatedTx.type = 2;

                    if (populatedTx.gasPrice != null) {

                        const gasPrice = populatedTx.gasPrice;
                        delete populatedTx.gasPrice;
                        populatedTx.maxFeePerGas = gasPrice;
                        populatedTx.maxPriorityFeePerGas = gasPrice;

                    } else {

                        if (populatedTx.maxFeePerGas == null) {
                            populatedTx.maxFeePerGas = feeData.maxFeePerGas;
                        }

                        if (populatedTx.maxPriorityFeePerGas == null) {
                            populatedTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                        }
                    }
                } else if (feeData.gasPrice != null) {
                    if (!hasEip1559) {
                        throw new Error("Network does not support eip-1559");
                    }

                    if (populatedTx.gasPrice == null) {
                        populatedTx.gasPrice = feeData.gasPrice;
                    }

                    populatedTx.type = 0;
                } else {
                    throw new Error("Failed to get fee data");
                }
            } else if (populatedTx.type === 2 || populatedTx.type === 3) {
                if (populatedTx.maxFeePerGas == null) {
                    populatedTx.maxFeePerGas = feeData.maxFeePerGas;
                }

                if (populatedTx.maxPriorityFeePerGas == null) {
                    populatedTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                }
            }
        }

        return await resolveProperties(populatedTx);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async sendTransaction(tx: TransactionRequest | any): Promise<TransactionResponse> {
        const provider = checkProvider(this, 'sendTransaction');
        if (!isSignedTransaction(tx)) {
            const populatedTx = await this.populateTransaction(tx);
            delete populatedTx.from;

            const txObj = Transaction.from(populatedTx);
            return await provider.broadcastTransaction(await this.signTransaction(txObj));
        } else {
            return await provider.broadcastTransaction(tx);
        }
    }

    async signMessage(message: Uint8Array | string): Promise<string> {
        return await this.getMessageSigned(message);
    }

    async signTransaction(tx: TransactionRequest): Promise<string> {
        const {to, from} = await resolveProperties({
            to: (tx.to? resolveAddress(tx.to, this.provider): undefined),
            from: (tx.from? resolveAddress(tx.from, this.provider): undefined)
        });

        if (to != null) { tx.to = to; }
        if (from != null) { tx.from = from; }

        if (tx.from != null) {
            if (getAddress(<string>tx.from) !== await this.getAddress()) {
                throw new Error(`transaction from address mismatch, expected ${await this.getWalletAddress()} but got ${tx.from}`);
            }
            delete tx.from;
        }

        return await this.getTransactionSigned(tx);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signTypedData(domain: any, types: any, value: any): Promise<string> {
        const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
           const provider = checkProvider(this, 'signTypedData');
           const address = await provider.resolveName(name);

           if (address == null) {
               throw new Error(`ENS name not found: ${name}`);
           }

           return address;
        });

        return await this.getMessageSigned(TypedDataEncoder.hash(populated.domain, types, populated.value));
    }


    // ------------------------------ Custom methods ------------------------------ //

    // Pass null to unset the provider
    setProvider(rpc_url: string | null): void {
        if (rpc_url) {
            this.provider = new JsonRpcProvider(rpc_url);
        } else {
            this.provider = null;
        }
    }

    setGasPrice(gasPrice: bigint): void {
        this.manualGasPrice = gasPrice;
    }

    setGasLimit(gasLimit: bigint): void {
        this.manualGasLimit = gasLimit;
    }

}
