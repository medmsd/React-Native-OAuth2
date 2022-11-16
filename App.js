//
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import {WebBrowserPresentationStyle} from 'expo-web-browser';
import {
    exchangeCodeAsync,
    fetchUserInfoAsync,
    makeRedirectUri,
    Prompt,
    refreshAsync,
    ResponseType,
    revokeAsync,
    TokenTypeHint,
    useAuthRequest,
} from 'expo-auth-session';
import {Alert, Button, Text, View} from 'react-native';
import axios from "axios";

WebBrowser.maybeCompleteAuthSession();

const clientId = 'defmarket-client';
const clientSecret = 'secret';
const IPAddress = '192.168.224.41'
const userPoolUrl = `http://${IPAddress}:9000`;
const redirectUri = makeRedirectUri({
    path: '/authorized',
    preferLocalhost: false,
});

WebBrowser.maybeCompleteAuthSession();

export default function App() {
    const [authTokens, setAuthTokens] = React.useState(null);
    const discoveryDocument = React.useMemo(() => ({
        authorizationEndpoint: `${userPoolUrl}/oauth2/authorize`,
        tokenEndpoint: `${userPoolUrl}/oauth2/token`,
        revocationEndpoint: `${userPoolUrl}/oauth2/revoke`,
        userInfoEndpoint: `${userPoolUrl}/userinfo`,
        registrationEndpoint: `${userPoolUrl}/connect/register`,
    }), []);
    // const request1 = new AuthRequest({
    //     clientId,
    //     responseType: ResponseType.Code,
    //     redirectUri,
    //     usePKCE: true,
    //     prompt: Prompt.Login,
    //     clientSecret,
    //     scopes: ['openid', 'profile']
    // });


    // async function login() {
    //     console.log("Code Verifier ", request1.codeVerifier);
    //     console.log("Request ", request1);
    //     const response = await request1.promptAsync(discoveryDocument);
    //     if (response.error) {
    //         Alert.alert(
    //             'Authentication error',
    //             response.params.error_description || 'something went wrong'
    //         );
    //         return;
    //     }
    //     if (response.type === 'success') {
    //         console.log("Response Request ", response);
    //         exchangeCodeAsync(
    //             {
    //                 clientId,
    //                 clientSecret,
    //                 extraParams: {
    //                     state: response.params.state,
    //                     code_verifier: request1.codeVerifier,
    //                 },
    //                 code: response.params.code,
    //                 redirectUri,
    //             },
    //             discoveryDocument
    //         ).then((res) => {
    //             console.log("Login Response ", res);
    //             setAuthTokens(res);
    //         }).catch((err) => {
    //             console.log("Error 1 ", err)
    //         });
    //     }
    // }

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId,
            responseType: ResponseType.Code,
            redirectUri,
            usePKCE: true,
            prompt: Prompt.Login,
            clientSecret,
            scopes: ['openid', 'profile'],

        },
        discoveryDocument
    );
    console.log(request);

    React.useEffect(() => {
        if (response) {
            if (response.error) {
                Alert.alert(
                    'Authentication error',
                    response.params.error_description || 'something went wrong'
                );
                return;
            }
            if (response.type === 'success') {
                console.log("Request Response ", response);
                console.log("Code Verifier ", request.codeVerifier)
                exchangeCodeAsync(
                    {
                        clientId,
                        clientSecret,
                        extraParams: {
                            state: response.params.state,
                            code_verifier: request.codeVerifier,
                        },
                        code: response.params.code,
                        scopes: ['openid', 'profile'],
                        redirectUri,
                    },
                    discoveryDocument
                ).then((res) => {
                    console.log("Login Response ", res);
                    setAuthTokens(res);
                }).catch((err) => {
                    console.log("Error 2 ", err)
                });
            }
        }
    }, [discoveryDocument, request, response]);

    const logout = async () => {
        const revokeResponse = await revokeAsync(
            {
                clientId,
                clientSecret,
                tokenTypeHint: TokenTypeHint.RefreshToken,
                token: authTokens.refreshToken,
            },
            discoveryDocument
        );
        console.log(revokeResponse);
        if (revokeResponse) {
            setAuthTokens(null);
        }
    };
    const getMessages = () => {
        axios.get(`http://${IPAddress}:8090/messages`, {
            headers: {
                Authorization: `Bearer ${authTokens.accessToken}`
            }
        }).then((res) => {
            Alert.alert("Messages", res.data.toString())
        }).catch((err) => {
            Alert.alert(err)
        })
    }

    const getUserInfo = () => {
        fetchUserInfoAsync({
            accessToken: authTokens.accessToken
        }, discoveryDocument).then((res) => {
            Alert.alert("User Info", JSON.stringify(res))
        }).catch((err) => {
            Alert.alert(err)
        });
    }

    const refreshToken = () => {
        refreshAsync({
            clientId: clientId,
            clientSecret,
            refreshToken: authTokens.refreshToken,
        }, discoveryDocument).then((res) => {
            setAuthTokens(res);
        }).catch((err) => {
            Alert.alert(err)
        });
    }


    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {authTokens ?
                <View style={{paddingTop: 20}}>
                    <Button title="Logout"
                            onPress={() => logout()}/>
                    <Button title="Get UserInfo"
                            onPress={() => getUserInfo()}/>
                    <Button title="Get Messages"
                            onPress={() => getMessages()}/>

                    <Button title="Refresh Token"
                            onPress={() => refreshToken()}/>
                    <Text>{JSON.stringify(authTokens.accessToken, null, 2)}</Text>
                    <Text>{JSON.stringify(authTokens.refreshToken, null, 2)}</Text>
                </View>
                :
                <View>
                    <Button disabled={!request}
                            title="Login"
                            onPress={() => promptAsync({
                                showTitle: true,
                                presentationStyle: WebBrowserPresentationStyle.OVER_CURRENT_CONTEXT,
                            })}/>
                    {/*<Button*/}
                    {/*    title="Login 2"*/}
                    {/*    onPress={() => login()}/>*/}
                </View>
            }
        </View>
    );
}
