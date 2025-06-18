import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AddDeviceScreen } from '../screens/AddDeviceScreen';
import { DeviceListScreen } from '../screens/DeviceListScreen';
import { ScanHostsScreen } from '../screens/ScanHostsScreen';
import { fonts, getColors, Colors } from '../styles/base';

const Tab = createBottomTabNavigator();

const useTabNavigatorStyles = () => {
  const colors: Colors = getColors();

  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.background,
    },
    tabBarLabel: {
      flex: 1,
      fontSize: fonts.mediumFontSize,
      textAlignVertical: 'center',
    },
    tabBarActiveTintColor: colors.secondary,
    tabBarInactiveTintColor: colors.primary,
    tabBarIconStyle: {
      height: 0,
      flex: 0,
    },
  });
};

export const TabNavigator = () => {
  const styles = useTabNavigatorStyles();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: styles.tabBarActiveTintColor,
        tabBarInactiveTintColor: styles.tabBarInactiveTintColor,
        tabBarIcon: () => null,
        tabBarIconStyle: styles.tabBarIconStyle, // Not using icons so collapse
      }}
    >
      <Tab.Screen
        name="AddDevice"
        component={AddDeviceScreen}
        options={{ tabBarLabel: 'Add Device' }}
      />
      <Tab.Screen
        name="DeviceList"
        component={DeviceListScreen}
        options={{ tabBarLabel: 'Device List' }}
      />
      <Tab.Screen
        name="ScanHosts"
        component={ScanHostsScreen}
        options={{ tabBarLabel: 'Scan Hosts' }}
      />
    </Tab.Navigator>
  );
};
