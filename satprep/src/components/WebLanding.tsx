import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type WebLandingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const WebLanding: React.FC = () => {
  const navigation = useNavigation<WebLandingNavigationProp>();

  // This component will only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>SAT Prep Powered by AI</Text>
        <Text style={styles.subtitle}>
          The smartest way to prepare for your SAT exam with personalized practice and real-time analytics
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.features}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>AI-Generated Questions</Text>
          <Text style={styles.featureDescription}>
            Get custom practice questions that adapt to your skill level and learning needs
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Personalized Analytics</Text>
          <Text style={styles.featureDescription}>
            Track your progress and identify areas for improvement with detailed performance insights
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Targeted Study Plans</Text>
          <Text style={styles.featureDescription}>
            Follow AI-recommended study paths based on your strengths and weaknesses
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          SAT Prep App - Use your own OpenAI and Google Search API keys for full functionality
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  hero: {
    backgroundColor: '#3b82f6',
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#1d4ed8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  features: {
    padding: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    width: 300,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#1f2937',
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});

export default WebLanding; 