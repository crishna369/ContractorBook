import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SiteListScreen } from '../screens/sites/SiteListScreen';
import { SiteDetailScreen } from '../screens/sites/SiteDetailScreen';

export type SitesStackParamList = {
  SiteList: undefined;
  SiteDetail: { siteId: string };
};

const Stack = createNativeStackNavigator<SitesStackParamList>();

export function SitesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SiteList" component={SiteListScreen} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} />
    </Stack.Navigator>
  );
}
