import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LearnScreen from './src/screens/LearnScreen';
import TraceScreen from './src/screens/TraceScreen';
import RawLogScreen from './src/screens/RawLogScreen';
import { SplashScreen } from './src/components/SplashScreen';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import { initDatabase } from './src/db/database';

export type RootStackParamList = {
  Learn: undefined;
  Trace: undefined;
  RawLog: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Init database in background
    initDatabase();
  }, []);

  if (!ready) {
    return (
      <GlobalErrorBoundary>
        <SplashScreen onComplete={() => setReady(true)} />
      </GlobalErrorBoundary>
    );
  }

  return (
    <GlobalErrorBoundary>
      <NavigationContainer documentTitle={{ formatter: () => 'Padhai Pocket' }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Learn" component={LearnScreen} />
          <Stack.Screen name="Trace" component={TraceScreen} />
          <Stack.Screen name="RawLog" component={RawLogScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GlobalErrorBoundary>
  );
}
