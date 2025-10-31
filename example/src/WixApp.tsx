import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import MainScreen from './screens/MainScreen';
import ErrorScreen from './screens/ErrorScreen';
import AboutScreen from './screens/AboutScreen';
import {
    DdRumReactNativeNavigationTracking,
    ViewTrackingMapper,
    ViewTrackingOptions,
    ComponentDidAppearEvent,
    Navigation
} from '@datadog/mobile-react-native-navigation';

import styles from './screens/styles';
import { DdTrace } from '@datadog/mobile-react-native';
import TraceScreen from './screens/TraceScreen';

const viewTrackingMapper: ViewTrackingMapper = (
    event: ComponentDidAppearEvent,
    trackedName: string): ViewTrackingOptions => {

    if (trackedName === "AlertModal") {
      return undefined;
    }

    const filteredPassProps: any = {};
    if (event.passProps?.creditCardNumber) {
      filteredPassProps["creditCardNumber"] = "XXXX XXXX XXXX XXXX";
    }

    if (event.passProps?.username) {
      filteredPassProps["username"] = event.passProps.username;
    }
    
    return {
      name: trackedName,
      passProps: filteredPassProps,
    }
}

function startReactNativeNavigation() {
    DdRumReactNativeNavigationTracking.startTracking(viewTrackingMapper);
    registerScreens();
    Navigation.events().registerAppLaunchedListener(async () => {
        Navigation.setRoot({
            root: {
                stack: {
                    children: [{ component: { name: 'Home' } }]
                }
            }
        });
    });
}

function registerScreens() {
    Navigation.registerComponent('Home', () => HomeScreen);
    Navigation.registerComponent('Main', () => MainScreen);
    Navigation.registerComponent('Error', () => ErrorScreen);
    Navigation.registerComponent('Trace', () => TraceScreen);
    Navigation.registerComponent('About', () => AboutScreen);
}

const HomeScreen = props => {
    return (
        <View style={styles.defaultScreen}>
            <Text style={{ marginBottom: 20 }}>
                Hello React Native Navigation 👋
            </Text>
            <Button
                title="Main"
                onPress={() => {
                    Navigation.push(props.componentId, {
                        component: { name: 'Main' }
                    });
                }}
            />
            <View style={{ marginTop: 20 }} />
            <Button
                title="Error"
                onPress={() => {
                    Navigation.push(props.componentId, {
                        component: { name: 'Error' }
                    });
                }}
            />
            <View style={{ marginTop: 20 }} />
            <Button
                title="Trace"
                onPress={() => {
                    Navigation.push(props.componentId, {
                        component: { name: 'Trace' }
                    });
                }}
            />
            <View style={{ marginTop: 20 }} />
            <Button
                title="About"
                onPress={() => {
                    Navigation.push(props.componentId, {
                        component: { 
                                name: 'About',
                                passProps: {
                                        username: "test",
                                        creditCardNumber: "4242 4242 4242 4242"
                                    } 
                         }
                    });
                }}
            />
        </View>
    );
};

export { startReactNativeNavigation };
