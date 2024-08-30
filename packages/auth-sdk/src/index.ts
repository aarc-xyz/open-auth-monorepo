import axios from 'axios';

interface StytchConfig {
    stytchUrls: Record<string, string>;
    pollUrls: Record<string, string>;
    publicToken: Record<string, string>;
    redirectUrl: Record<string, string>;
}

class AuthSDK {
    private clientId: string;
    private chainId: number;
    private env: string;
    private config: StytchConfig;

    constructor(clientId: string, chainId: number, env: string, config : StytchConfig) {
        if (env !== "prod" && env !== "staging") {
            throw new Error("Invalid environment provided. Please use 'prod' or 'staging'.");
        }

        this.config = config;

        this.clientId = clientId;
        this.chainId = chainId;
        this.env = env;
    }

    public async generateUrl(provider: string, session_identifier: string): Promise<string> {
        try {

            const state = JSON.stringify({
                provider,
                session_identifier,
                env: this.env,
                chainId: this.chainId,
                requestSource: window.origin
            });

            const pollUrl = this.config.pollUrls[this.env];
            const callBackUrlResponse = await axios.get(`${pollUrl}callback-url/${provider}`, { headers: { 'client-id': this.clientId } })

            if (callBackUrlResponse.data.data.hasNativeAuth) {
                return `${callBackUrlResponse.data.data.callbackUrl}&state=state`
            }
            const auth_portal_url = this.config.redirectUrl[this.env];
            if (provider == 'telegram') {
                const url = `${auth_portal_url}/telegram?state=${JSON.stringify(state)}`
                return url;
            }

            const redirect_url = this.config.redirectUrl[this.env] + 'auth/';
            const stytch_base_url = this.config.stytchUrls[this.env];
            const public_token = this.config.publicToken[this.env];

            const authUrl = `${stytch_base_url}/v1/public/oauth/${provider}/start?public_token=${public_token}&login_redirect_url=${redirect_url}?state=${state}&signup_redirect_url=${redirect_url}?state=${state}`;
           
            return authUrl;
        } catch (error) {

            console.error("Error during authentication:", error);
            throw error;
        }
    }

    public async pollStytchLogin(provider: string, session_identifier: string, onSuccess: (data: any) => void, onError: (data: any) => void, maxTime = 60, w: Window = window): Promise < void> {
    let timeElapsed = 0;

    const pollUrl = this.config.pollUrls[this.env];

    const poll = async () => {
        try {
            const res = await axios.get(
                `${pollUrl}poll-session/${provider}/${session_identifier}`,
                {
                    headers: {
                        "Request-Source": window.origin,
                    },
                }
            );

            const data = res.data;
            if (data.code === 200) {
                onSuccess(data);
            } else {
                onError(data);
            }
        } catch (err) {
            if (w.closed && timeElapsed < maxTime - 4) {
                timeElapsed = maxTime - 4;
            }

            timeElapsed++;

            if (timeElapsed >= maxTime) {
                console.error("Polling error: Time limit exceeded");
                onError({ message: "Time limit exceeded" });
                throw new Error("Time limit exceeded");
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            await poll();
        }
    };

    await poll();
}

    public async sendOTP(isEmail: boolean, data: string): Promise < { status: string, data?: any, message?: string, error?: any } > {
    try {
        const mode = isEmail ? "email" : "sms";
        const base_url = this.config.pollUrls[this.env];

        const response = await axios.get(`${base_url}passcode/${mode}/${data}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return { status: 'success', data: response.data };
    } catch(error) {
        console.error("Error during OTP sending:", error);
        return { status: 'error', message: 'Error during OTP sending', error };
    }
}

    public async verifyOTP(session_identifier: string, isEmail: boolean, data: string, otp: string): Promise < { status: string, data?: any, message?: string, error?: any } > {
    try {
        const base_url = this.config.pollUrls[this.env];
        const provider = isEmail ? "email" : "sms";

        const authenticateResponse = await axios.post(
            `${base_url}authenticate`,
            {
                code: otp,
                provider: provider,
                ...(isEmail ? { method_id: data } : { phone_number: data }),
                session_identifier: session_identifier,
                chainId: this.chainId,
            },
            {
                headers: {
                    "Request-Source": window.origin,
                },
            }
        );


        if(authenticateResponse.status === 200) {

    const pollResponse = await axios.get(
        `${base_url}poll-session/${provider}/${session_identifier}`
    );

    const responseData = pollResponse.data.data;
    if (pollResponse.data.code === 200) {
        return { status: "success", data: responseData };
    } else {
        throw new Error("Session polling failed.");
    }
} else {
    throw new Error("Authentication failed.");
}
        } catch (error) {
    console.error("Error during authentication:", error);
    return {
        status: "error",
        message: "Error during authentication",
        error: error,
    };
}
    }

    public async callExternalWallets(account: any, signature: any, message: string, provider: string, nonce: string): Promise < { status: string, data?: any, message?: string, error?: any } > {
    try {
        const base_url = this.config.pollUrls[this.env];

        const data = {
            address: account,
            message: message,
            signature: signature,
            walletType: provider,
            nonce: nonce
        };

        const response = await fetch(`${base_url}external-wallet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return { status: 'success', data: result };
    } catch (error) {
        console.error('Error during external wallet call:', error);
        return { status: 'error', message: 'Error during authentication', error };
    }
}

    public async farCasterLogin(session_identifier: string, data: any) {
    try {
        
        const profile = data;
        const base_url = this.config.pollUrls[this.env];

        await axios.post(`${base_url}authenticate`, {
            provider: "farcaster",
            session_identifier: session_identifier,
            chainId: this.chainId,
            farcaster_session: {
                message: data.message,
                nonce: data.nonce,
                domain: window.origin.split('//')[1],
                signature: data.signature,
            }
        }, {
            headers: {
                    "Request-Source": window.origin
            }
        }).catch(err => {
            return { status: 'error', message: 'Error during authentication', error: err };
        })

        const pollResponse:any = await axios.get(`${base_url}poll-session/farcaster/${session_identifier}`).catch(err => {
            return { status: 'error', message: 'Error during authentication', error: err };
        });

        const pollData = pollResponse?.data;
        if (pollData.code === 200) {
            pollData.data.user.profile_picture_url = profile.pfpUrl;
            return { status: 'success', data: pollData };
        }
    } catch (err) {
        console.log(err);
        return { status: 'error', message: 'Error during authentication', error: err };
    }
}

    public async  getTwitterLoginUrl(session_identifier: string) {
    try {
        const state = JSON.stringify({
            provider: "twitter",
            session_identifier,
            env: this.env,
            chainId: this.chainId,
            requestSource: window.origin
        });
        const encodedState = encodeURIComponent(state);
        const auth_portal_url = this.config.pollUrls[this.env];
        const res = await axios.get(`${auth_portal_url}x-token?state=${encodedState}`);
        const twitter_base = "https://api.twitter.com/oauth/authenticate?oauth_token="
        const url = `${twitter_base}${res.data.data}&state=${encodedState}`
        return url

    } catch (error) {
        console.error("Error during Twitter login:", error);
        throw error;
    }
}
}

export default AuthSDK;


