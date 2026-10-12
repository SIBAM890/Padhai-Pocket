import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import LearnScreen from './src/screens/LearnScreen';
import TraceScreen from './src/screens/TraceScreen';
import RawLogScreen from './src/screens/RawLogScreen';
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
    initDatabase().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#6ee7b7" />
        <Text style={styles.bootText}>PadhAI Pocket is getting ready…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Learn" component={LearnScreen} />
        <Stack.Screen name="Trace" component={TraceScreen} />
        <Stack.Screen name="RawLog" component={RawLogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07111f',
  },
  bootText: { marginTop: 12, color: '#e6edf5', fontSize: 16 },
});
