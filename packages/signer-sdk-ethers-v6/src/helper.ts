import {
    copyRequest,
    resolveAddress,
    resolveProperties,
    Transaction,
    TransactionLike,
    TransactionRequest
} from "ethers";
import { EthersSigner } from "./signers/ethers.signer";

export const checkProvider = (signer: EthersSigner, op: string) => {
    if (!signer.provider) {
        throw new Error(`Provider is not set, ${op} operation is not supported`);
    }
    return signer.provider;
}

export const populateAndResolve = async (signer: EthersSigner, tx: TransactionRequest): Promise<TransactionLike<string>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pop: any = copyRequest(tx);

    if (pop.to != null) {
        pop.to = await resolveAddress(pop.to, signer);
    }

    if (pop.from != null) {
        const from = pop.from;
        pop.from = Promise.all([
            signer.getAddress(),
            resolveAddress(from, signer)
        ])
            .then(([address, from]) => {
                if (address.toLowerCase() !== from.toLowerCase()) {
                    throw new Error(`from address mismatch, expected ${address} but got ${from}`)
                }
            });
    } else {
        pop.from = signer.getAddress();
    }
    return await resolveProperties(pop);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSignedTransaction = (tx: any): boolean => {
    try {
        if (typeof tx === 'string') {
            Transaction.from(tx);
            return true;
        }

        Transaction.from(tx);
        return false;
    } catch (error) {
        throw new Error(`Failed to check if transaction is signed: ${error}`);
    }
}
