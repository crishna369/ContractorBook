import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { AttendanceStack } from './AttendanceStack';
import { WorkersStack } from './WorkersStack';
import { SitesStack } from './SitesStack';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

export type AppTabsParamList = {
  Home: { screen?: string; params?: Record<string, unknown> } | undefined;
  Attendance: undefined;
  Workers: { screen?: string; params?: Record<string, unknown> } | undefined;
  Sites: { screen?: string; params?: Record<string, unknown> } | undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMutedA,
        tabBarLabelStyle: { fontFamily: fontFamily.bold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.bgPaper, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceStack}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'calendar-check' : 'calendar-check-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Workers"
        component={WorkersStack}
        options={{
          tabBarLabel: 'Workers',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account-hard-hat' : 'account-hard-hat-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Sites"
        component={SitesStack}
        options={{
          tabBarLabel: 'Sites',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'office-building' : 'office-building-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
