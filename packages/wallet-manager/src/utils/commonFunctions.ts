export function shortenWalletAddress(address:string, prefixLength = 6, suffixLength = 4) {
    if (!address || address.length < prefixLength + suffixLength) {
        return address; // Return the original address if it's too short
    }

    const prefix = address.slice(0, prefixLength);
    const suffix = address.slice(-suffixLength);

    return `${prefix}...${suffix}`;
}