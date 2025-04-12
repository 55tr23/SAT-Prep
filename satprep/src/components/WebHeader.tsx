import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type WebHeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface WebHeaderProps {
  title?: string;
}

const WebHeader: React.FC<WebHeaderProps> = ({ title = 'SAT Prep' }) => {
  const navigation = useNavigation<WebHeaderNavigationProp>();

  // Only show on web
  if (Platform.OS !== 'web') {
    return null;
  }

  const navigateToHome = () => {
    navigation.navigate('MainTabs');
  };

  const navigateToPractice = () => {
    // Navigate to Practice with minimal required params
    navigation.navigate('Practice', {});
  };

  const navigateToProgress = () => {
    navigation.navigate('Progress');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigation.navigate('WebLanding')}
        >
          <Ionicons name="school" size={24} color="#3b82f6" />
          <Text style={styles.logoText}>{title}</Text>
        </TouchableOpacity>
        
        <View style={styles.navLinks}>
          <TouchableOpacity 
            style={styles.navLink}
            onPress={navigateToHome}
          >
            <Text style={styles.navLinkText}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navLink}
            onPress={navigateToPractice}
          >
            <Text style={styles.navLinkText}>Practice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navLink}
            onPress={navigateToProgress}
          >
            <Text style={styles.navLinkText}>Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLink: {
    marginLeft: 24,
  },
  navLinkText: {
    fontSize: 14,
    color: '#4b5563',
  },
  navButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 24,
  },
  navButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default WebHeader; 