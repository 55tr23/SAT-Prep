import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import services and types
import { QuestionCategory, QuestionDifficulty } from '../services/AIService';
import { getSATUpdateInfo, updateQuestionBank } from '../services/QuestionService';

// Import navigation types
import { RootStackParamList } from '../navigation/types';

type PracticeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Practice'>;
type PracticeScreenRouteProp = RouteProp<RootStackParamList, 'Practice'>;

interface PracticeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  questionCount: number;
}

const PracticeScreen = () => {
  const navigation = useNavigation<PracticeScreenNavigationProp>();
  const route = useRoute<PracticeScreenRouteProp>();
  const params = route.params || {};
  
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(
    params.selectedCategory || null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [satUpdates, setSatUpdates] = useState(getSATUpdateInfo());

  // Check for SAT updates on mount
  useEffect(() => {
    const checkUpdates = async () => {
      setIsCheckingUpdates(true);
      await updateQuestionBank();
      setSatUpdates(getSATUpdateInfo());
      setIsCheckingUpdates(false);
      
      // Show alert if there are updates
      if (getSATUpdateInfo().hasUpdates) {
        Alert.alert(
          'SAT Format Updates Available', 
          `We've updated our question bank to match the latest ${getSATUpdateInfo().latestFormat}.`,
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
      }
    };
    
    checkUpdates();
  }, []);

  // Options for different practice types
  const practiceOptions: PracticeOption[] = [
    {
      id: 'math-easy',
      title: 'Math Basics',
      description: 'Foundational math problems covering algebra, geometry, and arithmetic',
      icon: 'calculator-outline',
      category: 'Algebra',
      difficulty: 'Easy',
      questionCount: 10,
    },
    {
      id: 'math-medium',
      title: 'Math Challenge',
      description: 'Intermediate math problems requiring deeper understanding',
      icon: 'trending-up-outline',
      category: 'Algebra',
      difficulty: 'Medium',
      questionCount: 10,
    },
    {
      id: 'reading-easy',
      title: 'Reading Comprehension',
      description: 'Practice understanding passages and answering questions about them',
      icon: 'book-outline',
      category: 'Reading Comprehension',
      difficulty: 'Medium',
      questionCount: 5,
    },
    {
      id: 'grammar-easy',
      title: 'Grammar Essentials',
      description: 'Review grammar rules and improve your writing skills',
      icon: 'text-outline',
      category: 'Grammar',
      difficulty: 'Easy',
      questionCount: 10,
    },
    {
      id: 'vocab-medium',
      title: 'Vocabulary Builder',
      description: 'Expand your vocabulary with word meaning and context questions',
      icon: 'chatbubbles-outline',
      category: 'Vocabulary',
      difficulty: 'Medium',
      questionCount: 15,
    },
    {
      id: 'full-test',
      title: 'Full SAT Practice',
      description: 'Complete SAT practice test with a mix of all question types',
      icon: 'school-outline',
      category: 'Algebra', // This will be overridden as we'll include multiple categories
      difficulty: 'Medium',
      questionCount: 20,
    },
    // New AI-powered practice options
    {
      id: 'ai-sat-2024',
      title: 'Latest 2024 SAT Format',
      description: 'Practice with questions that match the newest SAT format',
      icon: 'flash-outline',
      category: 'Algebra',
      difficulty: 'Medium',
      questionCount: 15,
    },
    {
      id: 'ai-personalized',
      title: 'AI-Personalized Practice',
      description: 'AI-generated questions tailored to your skill level',
      icon: 'brain-outline',
      category: 'Algebra',
      difficulty: 'Medium',
      questionCount: 10,
    }
  ];

  // Filter practice options based on selected category if any
  const filteredOptions = selectedCategory
    ? practiceOptions.filter(option => 
        option.category === selectedCategory || option.id === 'full-test' || 
        option.id === 'ai-sat-2024' || option.id === 'ai-personalized'
      )
    : practiceOptions;

  // Get recommendations based on a specific topic if provided
  const getTopicSpecificDescription = (topic?: string) => {
    if (!topic) return null;
    
    return `Practice questions focused specifically on "${topic}" to help strengthen your understanding.`;
  };

  const topicSpecificDescription = getTopicSpecificDescription(params.specificTopic);

  const startQuiz = (option: PracticeOption) => {
    setIsLoading(true);
    
    // Simulate loading the questions
    setTimeout(() => {
      setIsLoading(false);
      
      // Navigate to the quiz screen with the appropriate parameters
      navigation.navigate('Quiz', {
        quizType: option.id,
        category: option.category,
        difficulty: option.difficulty,
        questionCount: option.questionCount,
        specificTopic: params.specificTopic,
        useAI: useAI || option.id.startsWith('ai-'), // Force AI for AI-specific options
      });
    }, 1000);
  };

  const toggleAI = () => {
    setUseAI(!useAI);
    
    // Show toast or info message when toggling
    if (!useAI) {
      Alert.alert(
        'AI-Powered Questions Enabled',
        'You will now receive real-time generated questions based on the latest SAT format.',
        [{ text: 'OK' }]
      );
    }
  };

  const refreshSATUpdates = async () => {
    setIsCheckingUpdates(true);
    await updateQuestionBank();
    setSatUpdates(getSATUpdateInfo());
    setIsCheckingUpdates(false);
    
    Alert.alert(
      'Question Bank Updated',
      `Question bank is now aligned with ${getSATUpdateInfo().latestFormat}.`,
      [{ text: 'Great!' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedCategory ? `${selectedCategory} Practice` : 'Practice Tests'}
        </Text>
        
        {selectedCategory && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.backButtonText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SAT Updates Banner */}
      {satUpdates.hasUpdates && (
        <View style={styles.updateBanner}>
          <Ionicons name="information-circle" size={22} color="#3b82f6" />
          <Text style={styles.updateText}>
            {`Updated to ${satUpdates.latestFormat}`}
          </Text>
          {isCheckingUpdates ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <TouchableOpacity onPress={refreshSATUpdates}>
              <Ionicons name="refresh" size={20} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* AI Toggle */}
      <View style={styles.aiToggleContainer}>
        <View style={styles.aiToggleInfo}>
          <Ionicons name="bulb-outline" size={22} color="#3b82f6" />
          <Text style={styles.aiToggleText}>Use AI-generated questions</Text>
        </View>
        <Switch
          trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
          thumbColor={useAI ? '#3b82f6' : '#f3f4f6'}
          ios_backgroundColor="#d1d5db"
          onValueChange={toggleAI}
          value={useAI}
        />
      </View>

      {topicSpecificDescription && (
        <View style={styles.topicSpecificContainer}>
          <Text style={styles.topicSpecificTitle}>{params.specificTopic}</Text>
          <Text style={styles.topicSpecificDescription}>{topicSpecificDescription}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loaderText}>Preparing your practice questions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOptions}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionCard,
                item.id.startsWith('ai-') && styles.aiEnhancedCard
              ]}
              onPress={() => startQuiz(item)}
            >
              <View style={[
                styles.optionIconContainer,
                item.id.startsWith('ai-') && styles.aiEnhancedIcon
              ]}>
                <Ionicons name={item.icon as any} size={24} color={item.id.startsWith('ai-') ? "#ffffff" : "#3b82f6"} />
              </View>
              
              <View style={styles.optionContent}>
                <View style={styles.titleContainer}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  {item.id.startsWith('ai-') && (
                    <View style={styles.aiTag}>
                      <Text style={styles.aiTagText}>AI</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.optionDescription}>{item.description}</Text>
                
                <View style={styles.optionDetails}>
                  <View style={styles.optionDetailItem}>
                    <Ionicons name="help-circle-outline" size={14} color="#6b7280" />
                    <Text style={styles.optionDetailText}>{item.questionCount} questions</Text>
                  </View>
                  
                  <View style={styles.optionDetailItem}>
                    <Ionicons name="speedometer-outline" size={14} color="#6b7280" />
                    <Text style={styles.optionDetailText}>
                      {item.difficulty === 'Easy' ? 'Easy' : 
                       item.difficulty === 'Medium' ? 'Medium' : 'Hard'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  topicSpecificContainer: {
    backgroundColor: '#eef2ff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  topicSpecificTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  topicSpecificDescription: {
    fontSize: 14,
    color: '#4b5563',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiEnhancedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiEnhancedIcon: {
    backgroundColor: '#3b82f6',
  },
  optionContent: {
    flex: 1,
    marginRight: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  aiTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  optionDetails: {
    flexDirection: 'row',
  },
  optionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  optionDetailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dbeafe',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  updateText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
  },
  aiToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  aiToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiToggleText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
});

export default PracticeScreen; 