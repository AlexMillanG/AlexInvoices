import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import LandingPage from './components/LandingPage';

const Stack = createNativeStackNavigator();

export default function App() {
    const [scannedCodes, setScannedCodes] = useState([]);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Landing">
                <Stack.Screen
                    name="Landing"
                    options={{ headerShown: false }}
                >
                    {props => <LandingPage {...props} scannedCodes={scannedCodes} setScannedCodes={setScannedCodes} />}
                </Stack.Screen>
                <Stack.Screen
                    name="Scanner"
                    options={{ title: 'Escanear Código' }}
                >
                    {props => <BarcodeScanner {...props} setScannedCodes={setScannedCodes} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}