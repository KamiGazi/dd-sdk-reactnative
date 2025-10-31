import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from './screens/MainScreen';
import ErrorScreen from './screens/ErrorScreen';
import AboutScreen from './screens/AboutScreen';
import style from './screens/styles';
import { navigationRef } from './NavigationRoot';
import { DdRumReactNavigationTracking, ViewNamePredicate, ViewTrackingPredicate, ParamsTrackingPredicate} from '@datadog/mobile-react-navigation';
import {DatadogProvider} from '@datadog/mobile-react-native'
import { Route } from "@react-navigation/native";
import { NestedNavigator } from './screens/NestedNavigator/NestedNavigator';
import { getDatadogConfig, onDatadogInitialization } from './ddUtils';
import { TrackingConsent } from '@datadog/mobile-react-native';

const Tab = createBottomTabNavigator();

const viewNamingPredicate: ViewNamePredicate = function customViewNamePredicate(route: Route<string, any | undefined>, trackedName: string) {
  return "Custom RN " + trackedName;
}

const viewTrackingPredicate: ViewTrackingPredicate = function customViewTrackingPredicate(route: Route<string, any | undefined>) { 
  if (route.name === "AlertModal") {
    return false;
  }

  return true;
}

const paramsTrackingPredicate: ParamsTrackingPredicate = function customParamsTrackingPredicate(route: Route<string, any | undefined>) { 
  const filteredParams: any = {};
  if (route.params?.creditCardNumber) {
    filteredParams["creditCardNumber"] = "XXXX XXXX XXXX XXXX";
  }

  if (route.params?.username) {
    filteredParams["username"] = route.params.username;
  }

  return filteredParams;
}

// === Datadog Provider Configuration schemes ===

// 1.- Direct configuration
const configuration = getDatadogConfig(TrackingConsent.GRANTED)

// 2.- File based configuration from .json
// const configuration = new FileBasedConfiguration(require("../datadog-configuration.json"));

// 3.- File based configuration from .json and custom mapper setup
// const configuration = new FileBasedConfiguration( {
//   configuration: require("../datadog-configuration.json").configuration, 
//   errorEventMapper: (event) => event, 
//   resourceEventMapper: (event) => event, 
//   actionEventMapper: (event) => event});

export default function App() {
  return (
    <DatadogProvider configuration={configuration} onInitialization={onDatadogInitialization}>
      <NavigationContainer ref={navigationRef} onReady={() => {
        DdRumReactNavigationTracking.startTrackingViews(navigationRef.current, viewNamingPredicate, viewTrackingPredicate, paramsTrackingPredicate)
      }}>
        <Tab.Navigator screenOptions={{
          tabBarLabelStyle: style.tabLabelStyle,
          tabBarStyle: style.tabItemStyle,
          tabBarIcon: () => null
        }}>
          <Tab.Screen name="Home" component={MainScreen} />
          <Tab.Screen name="Error" component={ErrorScreen} />
          <Tab.Screen name="About" component={AboutScreen} />
          <Tab.Screen name="Nested" component={NestedNavigator} />
        </Tab.Navigator>
      </NavigationContainer>
    </DatadogProvider>
  )
}
