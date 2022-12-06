import {makeRedirectUri} from "expo-auth-session";

const clientId = 'defmarket-client';
const clientSecret = 'secret';
const IPAddress = 'http://192.168.1.7';
const issuer = `${IPAddress}:9000`;
const backend = `${IPAddress}:8080`;
const scopes = ['openid', 'profile']
const redirectUri = makeRedirectUri({
    path: '/Home'
});
const discoveryDocument = {
    authorizationEndpoint: `${issuer}/oauth2/authorize`,
    tokenEndpoint: `${issuer}/oauth2/token`,
    revocationEndpoint: `${issuer}/oauth2/revoke`,
    userInfoEndpoint: `${issuer}/userinfo`,
}
export const OAuth2 = {
    discoveryDocument,
    redirectUri,
    issuer,
    clientId,
    clientSecret,
    backend,
    scopes
}

