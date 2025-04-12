import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ApiKeyService } from '../services/ApiKeyService';
import { ApiKeys, areApiKeysConfigured, ENV_API_KEYS } from '../config/env';
import { RootStackParamList } from '../navigation/types';

type ApiKeysScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApiKeys'>;

const ApiKeysScreen: React.FC = () => {
  const navigation = useNavigation<ApiKeysScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    search: '',
    searchEngineId: '',
  });
  const [showKeys, setShowKeys] = useState(false);
  const [usingEnvVars, setUsingEnvVars] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await ApiKeyService.getApiKeys();
      setApiKeys(keys);
      
      // Check if we're using environment variables
      const isUsingEnvVars = !!(ENV_API_KEYS.openai && ENV_API_KEYS.search && ENV_API_KEYS.searchEngineId);
      setUsingEnvVars(isUsingEnvVars);
    } catch (error) {
      Alert.alert('Error', 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const saveApiKeys = async () => {
    try {
      setSaving(true);
      await ApiKeyService.saveApiKeys(apiKeys);
      Alert.alert('Success', 'API keys saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API keys');
    } finally {
      setSaving(false);
    }
  };

  const clearApiKeys = async () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to clear all API keys?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await ApiKeyService.clearApiKeys();
              setApiKeys({
                openai: '',
                search: '',
                searchEngineId: '',
              });
              Alert.alert('Success', 'API keys cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear API keys');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Configuration</Text>
      </View>

      <ScrollView style={styles.content}>
        {usingEnvVars && (
          <View style={[styles.infoCard, styles.envVarCard]}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.envVarText}>
              API keys are configured through environment variables. The settings below are for reference only.
            </Text>
          </View>
        )}
        
        <Text style={styles.description}>
          {usingEnvVars 
            ? "Your API keys are configured through environment variables in the .env file."
            : "Configure your API keys to enable AI-powered features. Your keys are stored securely on your device."}
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            For production use, it's recommended to set API keys in the .env file at the root of your project.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>OpenAI API Key</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, usingEnvVars && styles.disabledInput]}
              value={apiKeys.openai}
              onChangeText={(text) => setApiKeys({ ...apiKeys, openai: text })}
              placeholder="Enter OpenAI API Key"
              secureTextEntry={!showKeys}
              autoCapitalize="none"
              editable={!usingEnvVars}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Google Search API Key</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, usingEnvVars && styles.disabledInput]}
              value={apiKeys.search}
              onChangeText={(text) => setApiKeys({ ...apiKeys, search: text })}
              placeholder="Enter Google Search API Key"
              secureTextEntry={!showKeys}
              autoCapitalize="none"
              editable={!usingEnvVars}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Google Search Engine ID</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, usingEnvVars && styles.disabledInput]}
              value={apiKeys.searchEngineId}
              onChangeText={(text) => setApiKeys({ ...apiKeys, searchEngineId: text })}
              placeholder="Enter Google Search Engine ID"
              secureTextEntry={!showKeys}
              autoCapitalize="none"
              editable={!usingEnvVars}
            />
          </View>
        </View>

        {!usingEnvVars && (
          <>
            <View style={styles.showKeysContainer}>
              <TouchableOpacity
                onPress={() => setShowKeys(!showKeys)}
                style={styles.showKeysButton}
              >
                <Ionicons name={showKeys ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                <Text style={styles.showKeysText}>{showKeys ? "Hide Keys" : "Show Keys"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveApiKeys}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Keys</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearApiKeys}
                disabled={saving}
              >
                <Text style={styles.clearButtonText}>Clear Keys</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.helpLinks}>
          <Text style={styles.helpTitle}>How to get API keys:</Text>
          <TouchableOpacity style={styles.helpLink}>
            <Ionicons name="open-outline" size={16} color="#3b82f6" />
            <Text style={styles.helpLinkText}>OpenAI API Keys Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpLink}>
            <Ionicons name="open-outline" size={16} color="#3b82f6" />
            <Text style={styles.helpLinkText}>Google Custom Search Guide</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, styles.envFileInfo]}>
          <Ionicons name="code-outline" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            For production, edit the .env file in the root directory with your API keys:
          </Text>
        </View>
        
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>OPENAI_API_KEY=your_key</Text>
          <Text style={styles.codeText}>GOOGLE_SEARCH_API_KEY=your_key</Text>
          <Text style={styles.codeText}>GOOGLE_SEARCH_ENGINE_ID=your_id</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ebf5ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#1e40af',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  showKeysContainer: {
    marginBottom: 24,
  },
  showKeysButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showKeysText: {
    color: '#6b7280',
    marginLeft: 6,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  helpLinks: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpLinkText: {
    color: '#3b82f6',
    marginLeft: 8,
    fontSize: 14,
  },
  envVarCard: {
    backgroundColor: '#ebf5ff',
  },
  envVarText: {
    color: '#1e40af',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
  },
  envFileInfo: {
    marginTop: 20,
    backgroundColor: '#f0f9ff',
  },
  codeBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 30,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#f8fafc',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default ApiKeysScreen; 