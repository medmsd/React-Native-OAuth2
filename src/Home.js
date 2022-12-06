import {Alert, Button, Text, View} from "react-native";
import * as React from "react";
import {useEffect, useState} from "react";
import {fetchUserInfoAsync, refreshAsync, revokeAsync, TokenTypeHint} from "expo-auth-session";
import {openBrowserAsync} from "expo-web-browser";
import axios from "axios";
import {OAuth2} from "./Config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from "@react-navigation/native";

export default function Home({route}) {
    const navigation = useNavigation()
    const [authTokens, setAuthTokens] = useState(null);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            initTokens();
        });

        return unsubscribe;
    }, [navigation]);

    function initTokens() {
        AsyncStorage.getItem("authTokens").then(value => {
            if (value) {
                setAuthTokens(JSON.parse(value));
            }
        });
    }


    const logout = async () => {
        const revokeResponse = await revokeAsync(
            {
                clientId: OAuth2.clientId,
                clientSecret: OAuth2.clientSecret,
                tokenTypeHint: TokenTypeHint.RefreshToken,
                token: authTokens.refreshToken,
            },
            OAuth2.discoveryDocument
        );
        if (revokeResponse) {
            openBrowserAsync(`${OAuth2.issuer}/logout`, {}).then((res) => {
                console.log("Logout Response ", res);
                setAuthTokens(null);
                AsyncStorage.removeItem("authTokens").then(() => {
                    navigation.navigate("Login");
                });
            }).catch((err) => {
                console.log("Error 3 ", err)
            });
        }
    };
    const myData = () => {
        axios.get(`${OAuth2.backend}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${authTokens.accessToken}`
            }
        }).then((res) => {
            Alert.alert("My Data", JSON.stringify(res.data))
        }).catch((err) => {
            Alert.alert(err)
        })
    }

    const getUserInfo = () => {
        fetchUserInfoAsync({
            accessToken: authTokens.accessToken
        }, OAuth2.discoveryDocument).then((res) => {
            Alert.alert("User Info", JSON.stringify(res))
        }).catch((err) => {
            Alert.alert(err)
        });
    }

    const refreshToken = () => {
        refreshAsync({
            clientId: OAuth2.clientId,
            clientSecret: OAuth2.clientSecret,
            refreshToken: authTokens.refreshToken,
        }, OAuth2.discoveryDocument).then((res) => {
            console.log("Refresh Token", res);
            setAuthTokens(res);
        }).catch((err) => {
            Alert.alert(err)
        });
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{paddingTop: 20}}>
                <Button title="Logout"
                        onPress={() => logout()}/>
                <Button title="Get UserInfo"
                        onPress={() => getUserInfo()}/>
                <Button title="Get MyData"
                        onPress={() => myData()}/>

                <Button title="Refresh Token"
                        onPress={() => refreshToken()}/>
                {authTokens && <View>
                    <Text>{JSON.stringify(authTokens.accessToken, null, 2)}</Text>
                    <Text>{JSON.stringify(authTokens.refreshToken, null, 2)}</Text>
                </View>}
            </View>
        </View>
    )
}
