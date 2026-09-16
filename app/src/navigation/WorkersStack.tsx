import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkerListScreen } from '../screens/workers/WorkerListScreen';
import { WorkerDetailScreen } from '../screens/workers/WorkerDetailScreen';
import { PayWorkerScreen } from '../screens/workers/PayWorkerScreen';

export type WorkersStackParamList = {
  WorkerList: undefined;
  WorkerDetail: { workerId: string };
  PayWorker: { workerId: string };
};

const Stack = createNativeStackNavigator<WorkersStackParamList>();

export function WorkersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkerList" component={WorkerListScreen} />
      <Stack.Screen name="WorkerDetail" component={WorkerDetailScreen} />
      <Stack.Screen name="PayWorker" component={PayWorkerScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
