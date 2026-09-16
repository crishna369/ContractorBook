import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CashBankLedgerScreen } from '../screens/home/CashBankLedgerScreen';
import { SetOpeningBalanceScreen } from '../screens/home/SetOpeningBalanceScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  CashBankLedger: undefined;
  SetOpeningBalance: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CashBankLedger" component={CashBankLedgerScreen} />
      <Stack.Screen
        name="SetOpeningBalance"
        component={SetOpeningBalanceScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
