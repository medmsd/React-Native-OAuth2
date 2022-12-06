import {ActivityIndicator, Alert, Button, StyleSheet, View} from "react-native";
import * as React from "react";
import {exchangeCodeAsync, Prompt, ResponseType, useAuthRequest} from "expo-auth-session";
import {OAuth2} from "./Config";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({route, navigation}) {
    console.log("Route", route);
    console.log("Navigation", navigation);
    const [animating, setAnimating] = React.useState(false);
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: OAuth2.clientId,
            responseType: ResponseType.Code,
            redirectUri: OAuth2.redirectUri,
            usePKCE: true,
            prompt: Prompt.Login,
            clientSecret: OAuth2.clientSecret,
            scopes: OAuth2.scopes,

        },
        OAuth2.discoveryDocument
    );
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
                console.log("RedirectUri", OAuth2.redirectUri);
                console.log("Request Response ", response);
                console.log("Code Verifier ", request.codeVerifier)
                setAnimating(true);
                exchangeCodeAsync(
                    {
                        clientId: OAuth2.clientId,
                        clientSecret: OAuth2.clientSecret,
                        extraParams: {
                            state: response.params.state,
                            code_verifier: request.codeVerifier,
                        },
                        code: response.params.code,
                        scopes: ['openid', 'profile'],
                        redirectUri: OAuth2.redirectUri,
                    },
                    OAuth2.discoveryDocument
                ).then((res) => {

                    console.log("Login Response ", res);
                    AsyncStorage.setItem("authTokens", JSON.stringify(res)).then(() => {
                        setAnimating(false);
                        navigation.navigate("Home");
                    });
                }).catch((err) => {
                    console.log("Error 2 ", err)
                });
            }
        }
    }, [OAuth2.discoveryDocument, request, response]);
    return (
        <View style={styles.container}>
            {animating ? <ActivityIndicator size="large"
                                            color="#0000ff"/> :
                <Button
                    title="Login"
                    onPress={() => {
                        promptAsync();
                    }}
                />
            }
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 5,
    }
})
