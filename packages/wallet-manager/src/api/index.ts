

import { BRIDGE_SWAP_BASE_URL,  } from "../constants";
import axios from "axios";
import {BASE_URL_OPEN_AUTH} from "../constants";
export const getMultiChainBalances = async (apiKey:string, walletAddress:string) => {
    const response = await fetch(`${BRIDGE_SWAP_BASE_URL}/balances/${walletAddress}`, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    const json = await response.json();
    return json;
};


export const getSupportedTokens = async (apiKey:string, chainId : number) => {
    const endPoint = `${BRIDGE_SWAP_BASE_URL}/supported-tokens?chainId=${chainId}&isShortList=${true}`;
    const response = await fetch(endPoint, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
            Accept: "application/json",
            "Content-Type": "application/json",
        } as HeadersInit,
    });
    const json = await response.json();
    return json;
}

export function sendTransaction (apiKey:string, tx: any, chainId: number, sessionKey: string, session_identifier: string) {
    tx.value = tx.value * 10**18
  return  axios.post(`${BASE_URL_OPEN_AUTH}/send-transaction`,
            {
                "provider": localStorage.getItem('provider'),
                "session_identifier": session_identifier,
                "transaction": tx,
                "sessionKey": sessionKey,
                "chainId": chainId
            },
            {
                headers: {
                    "x-api-key": apiKey,
                }
            }
        )
}


export const getTransactions = async (apiKey:string, walletAddress:string) => {
    const response = await fetch(`${BASE_URL_OPEN_AUTH}/get-pkp-txns/${walletAddress}`, {
        method: "GET",
        headers: {
            "x-api-key": apiKey
        },
    });
    const json = await response.json();
    return json;
}

export const getSupportedChains = async (apiKey:string) => {
    const endPoint = `${BRIDGE_SWAP_BASE_URL}/supported-chains`;
    const response = await fetch(endPoint, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
            Accept: "application/json",
            "Content-Type": "application/json",
        } as HeadersInit,
    });
    const json = await response.json();
    console.log(json, "chainssss")
    return json;
}