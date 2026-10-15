import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LearnScreen from './src/screens/LearnScreen';
import TraceScreen from './src/screens/TraceScreen';
import RawLogScreen from './src/screens/RawLogScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import TeacherViewScreen from './src/screens/TeacherViewScreen';
import SubjectPickerScreen from './src/screens/SubjectPickerScreen';
import ResourceManagerScreen from './src/screens/ResourceManagerScreen';
import { SplashScreen } from './src/components/SplashScreen';
import { GlobalErrorBoundary } from './src/errorBoundary/GlobalErrorBoundary';
import { initDatabase } from './src/db/database';
import { FINALE_ROUTES } from './src/navigation/FinaleRoutes';

import { StatusBar } from 'react-native';
import { colors } from './src/theme/theme';

export type RootStackParamList = {
  SubjectPicker: { initialSubjectId?: string } | undefined;
  Learn: { profileId?: string; subject?: string; chunkId?: string; subjectId?: string; topicId?: string; conceptId?: string; navTimestamp?: number; openJugaadLab?: boolean } | undefined;
  Trace: undefined;
  RawLog: undefined;
  Progress: { profileId: string };
  TeacherView: { profileId: string };
  ResourceManager: undefined;
};

export { FINALE_ROUTES };

const Stack = createNativeStackNavigator<RootStackParamList>();

const appNavigationTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background, // cream #FDF6E3
    card: colors.surface,          // white #FFFFFF
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Init database in background
    initDatabase();
  }, []);

  if (!ready) {
    return (
      <GlobalErrorBoundary>
        <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
        <SplashScreen onComplete={() => setReady(true)} />
      </GlobalErrorBoundary>
    );
  }

  return (
    <GlobalErrorBoundary>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <NavigationContainer
        theme={appNavigationTheme}
        documentTitle={{ formatter: () => 'Padhai Pocket' }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Learn" component={LearnScreen} />
          <Stack.Screen name="SubjectPicker" component={SubjectPickerScreen} />
          <Stack.Screen name="Trace" component={TraceScreen} />
          <Stack.Screen name="RawLog" component={RawLogScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="TeacherView" component={TeacherViewScreen} />
          <Stack.Screen name="ResourceManager" component={ResourceManagerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GlobalErrorBoundary>
  );
}
