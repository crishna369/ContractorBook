import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SiteListScreen } from '../screens/sites/SiteListScreen';
import { SiteDetailScreen } from '../screens/sites/SiteDetailScreen';
import { SiteExpenseScreen } from '../screens/sites/SiteExpenseScreen';
import { AddBillScreen } from '../screens/sites/AddBillScreen';
import { BillDetailScreen } from '../screens/sites/BillDetailScreen';

export type SitesStackParamList = {
  SiteList: undefined;
  SiteDetail: { siteId: string };
  SiteExpense: { siteId: string };
  AddBill: { siteId: string };
  BillDetail: { billId: string };
};

const Stack = createNativeStackNavigator<SitesStackParamList>();

export function SitesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SiteList" component={SiteListScreen} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} />
      <Stack.Screen name="SiteExpense" component={SiteExpenseScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddBill" component={AddBillScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} />
    </Stack.Navigator>
  );
}
