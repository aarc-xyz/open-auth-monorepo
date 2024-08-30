

import { BRIDGE_SWAP_BASE_URL,  } from "../constants";
import axios from "axios";
import {BASE_URL_OPEN_AUTH} from "../constants";
export const getMultiChainBalances = async (walletAddress:string) => {
    const response = await fetch(`${BRIDGE_SWAP_BASE_URL}/balances/${walletAddress}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    const json = await response.json();
    return json;
};


export const getSupportedTokens = async (chainId : number) => {
    const endPoint = `${BRIDGE_SWAP_BASE_URL}/supported-tokens?chainId=${chainId}&isShortList=${true}`;
    const response = await fetch(endPoint, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        } as HeadersInit,
    });
    const json = await response.json();
    return json;
}

export function sendTransaction (tx: any, chainId: number, sessionKey: string, session_identifier: string) {
    tx.value = tx.value * 10**18
  return  axios.post(`${BASE_URL_OPEN_AUTH}/send-transaction`,
            {
                "provider": localStorage.getItem('provider'),
                "session_identifier": session_identifier,
                "transaction": tx,
                "sessionKey": sessionKey,
                "chainId": chainId
            }
        )
}


export const getTransactions = async (walletAddress:string) => {
    const response = await fetch(`${BASE_URL_OPEN_AUTH}/get-pkp-txns/${walletAddress}`, {
        method: "GET",
        headers: {
        },
    });
    const json = await response.json();
    return json;
}

export const getSupportedChains = async () => {
    const endPoint = `${BRIDGE_SWAP_BASE_URL}/supported-chains`;
    const response = await fetch(endPoint, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        } as HeadersInit,
    });
    const json = await response.json();
    console.log(json, "chainssss")
    return json;
}