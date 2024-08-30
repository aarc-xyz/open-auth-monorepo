import React from "react";

export enum OAuthProvider {
    GOOGLE = 'google',
    TWITTER = 'twitter',
    DISCORD = 'discord',
    FARCASTER = 'farcaster',
    TELEGRAM = 'telegram',
}

export enum AuthMethod {
    EMAIL = 'email',
    WALLET = 'wallet',
    SMS = 'sms',
}

export type AarcAuthWidgetConfig = {
    Wallet?: React.FC<any>;
    callbacks: {
        onSuccess: (data : PollResponse) => void;
        onError: Function;
        onClose: Function;
        onOpen: Function;
    };
    appearance: {
        logoUrl: string;
        themeColor: string;
        darkMode: boolean;
        textColor: string;
    };
    authMethods: AuthMethod[];
    socialAuth: OAuthProvider[];
    clientId?: string;
    chainId: number;
    urls: any;
    env: 'production' | 'staging'
};

export const sessionKeys = {
    SESSION_IDENTIFIER: 'session_identifier',
    SESSION_KEY: 'sessionKey'
}

type Provider = {
    logo: string; 
    label: string;
    name: string;
  };


export type OauthProviderKey =  "google" | "twitter" | "farcaster" | "discord" | "telegram"

export type ProviderKey = OauthProviderKey | "email" | "sms";

export type Providers = {
    [key in OauthProviderKey]: Provider;
  };


export type PollResponse = {
    code: number;
    data: {
      wallet_address: string;
      user: {
        first_name: string;
        last_name: string;
        primary_contact: string;
        _id: string;
        profile_picture_url? : string
      };
      key: string;
    };
    message: string;
};


export type farCasterPollResponse = {
    data : PollResponse
}

export type step = "home" | "loading" | "wallets" | "error" | "passkey"
