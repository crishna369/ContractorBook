import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { WorkerListScreen } from '../screens/workers/WorkerListScreen';
import { SitesStack } from './SitesStack';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

// TODO(phase 4): add an Attendance tab once AttendanceListScreen/MarkAttendanceSheet exist,
// matching the 4-tab design (Home/Attendance/Workers/Sites).
const Tab = createBottomTabNavigator();

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
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <Text style={{ color }}>●</Text> }}
      />
      <Tab.Screen
        name="Workers"
        component={WorkerListScreen}
        options={{ tabBarLabel: 'Workers', tabBarIcon: ({ color }) => <Text style={{ color }}>●</Text> }}
      />
      <Tab.Screen
        name="Sites"
        component={SitesStack}
        options={{ tabBarLabel: 'Sites', tabBarIcon: ({ color }) => <Text style={{ color }}>●</Text> }}
      />
    </Tab.Navigator>
  );
}
