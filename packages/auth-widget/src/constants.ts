export const env : string = "prod"
export const base_url = env === "staging" ? "https://open-auth.staging.aarc.xyz/" : "https://open-auth.aarc.xyz/"
export const stytch_base_url = env === "staging" ? "https://test.stytch.com/" : "https://api.stytch.aarc.xyz/"
export const public_token = env === "staging" ? "stytch-public-prod-token" : "stytch-public-stage-token"