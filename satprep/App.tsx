import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, Platform } from 'react-native';

// Import context provider
import { UserProvider } from './src/context/UserContext';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested', 
  'Setting a timer for a long period of time'
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppNavigator />
        {Platform.OS !== 'web' && <StatusBar style="auto" />}
      </UserProvider>
    </SafeAreaProvider>
  );
} 