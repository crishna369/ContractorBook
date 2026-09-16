import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AttendanceListScreen } from '../screens/attendance/AttendanceListScreen';
import { MarkAttendanceSheet } from '../screens/attendance/MarkAttendanceSheet';

export type AttendanceStackParamList = {
  AttendanceList: undefined;
  MarkAttendance: { workerId: string; date: string };
};

const Stack = createNativeStackNavigator<AttendanceStackParamList>();

export function AttendanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendanceSheet} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
