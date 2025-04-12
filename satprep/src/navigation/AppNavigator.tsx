import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PracticeScreen from '../screens/PracticeScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultsScreen from '../screens/ResultsScreen';
import AIAnalysisScreen from '../screens/AIAnalysisScreen';
import ProgressScreen from '../screens/ProgressScreen';
import WebLanding from '../components/WebLanding';

// Import types
import { RootStackParamList } from './types';

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Practice') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'AIAnalysis') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Practice" 
        component={PracticeScreen}
        options={{ title: 'Practice' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen 
        name="AIAnalysis" 
        component={AIAnalysisScreen}
        options={{ title: 'AI Analysis' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Platform.OS === 'web' ? 'WebLanding' : 'MainTabs'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {Platform.OS === 'web' && (
          <Stack.Screen name="WebLanding" component={WebLanding} />
        )}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen 
          name="Quiz" 
          component={QuizScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Progress" 
          component={ProgressScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 