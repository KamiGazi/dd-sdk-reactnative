import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import MainScreen from './screens/MainScreen';
import ErrorScreen from './screens/ErrorScreen';
import AboutScreen from './screens/AboutScreen';
import {
    DdRumReactNativeNavigationTracking,
    ViewNamePredicate,
    ViewTrackingPredicate,
    ParamsTrackingPredicate,
    ComponentDidAppearEvent,
    Navigation
} from '@datadog/mobile-react-native-navigation';

import styles from './screens/styles';
import TraceScreen from './screens/TraceScreen';

const viewNamePredicate: ViewNamePredicate = function customViewNamePredicate(_event: ComponentDidAppearEvent, trackedName: string) {
    return "Custom RN " + trackedName;
}

const viewTrackingPredicate: ViewTrackingPredicate = function customViewTrackingPredicate(event: ComponentDidAppearEvent) { 
    if (event.name === "AlertModal") {
        return false;
    }

    return true;
}

const paramsTrackingPredicate: ParamsTrackingPredicate = function customParamsTrackingPredicate(event: ComponentDidAppearEvent) { 
    const filteredParams: any = {};
    if (event.passProps?.creditCardNumber) {
        filteredParams["creditCardNumber"] = "XXXX XXXX XXXX XXXX";
    }

    if (event.passProps?.username) {
        filteredParams["username"] = event.passProps.username;
    }

    return filteredParams;
}

function startReactNativeNavigation() {
    DdRumReactNativeNavigationTracking.startTracking(viewNamePredicate, viewTrackingPredicate, paramsTrackingPredicate);
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
                        component: { name: 'Error' },
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
                        component: { name: 'About',
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
