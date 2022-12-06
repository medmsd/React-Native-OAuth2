//
import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import linking from "./src/Linking";
import Login from "./src/Login";
import Home from "./src/Home";

export default function App() {
    const Stack = createNativeStackNavigator();
    const navigationRef = useNavigationContainerRef();

    return (
        <NavigationContainer ref={navigationRef}
                             linking={linking}>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login"
                              component={Login}/>
                <Stack.Screen name="Home"
                              component={Home}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}
