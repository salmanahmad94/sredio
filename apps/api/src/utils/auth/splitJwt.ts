/**
 * Splits a JWT into its claim (`header.payload`) and its signature.
 *
 * The claim goes to the client in the response body and comes back in the Authorization
 * header. The signature goes into an httpOnly cookie. Neither half is a usable token alone:
 * script on the page can't read the signature, and another site can't set the header.
 */
export const splitJwt = (token: string): { claim: string; signature: string } => {
    const lastDot = token.lastIndexOf('.');

    return { claim: token.slice(0, lastDot), signature: token.slice(lastDot + 1) };
};

/** Rebuilds the token from the `Authorization: Bearer <claim>` header and the signature cookie. */
export const combineJwt = (
    authorization: string | undefined,
    signature: string | undefined
): string | null => {
    const claim = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!claim || !signature || claim.split('.').length !== 2) return null;

    return `${claim}.${signature}`;
};
