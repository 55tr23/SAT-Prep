import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import context
import { UserContext } from '../context/UserContext';

// Import services
import { updateQuestionBank } from '../services/QuestionService';
import { QuestionCategory } from '../services/AIService';

// Import components
import ProgressChart from '../components/ProgressChart';
import RecommendedTopics from '../components/RecommendedTopics';
import WebHeader from '../components/WebHeader';

// Import types
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isLoading } = useContext(UserContext);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Set a random last updated date for demo purposes
    setLastUpdated(new Date(Date.now() - Math.random() * 86400000 * 3)); // Random time in the last 3 days
    
    // Update question bank on initial load
    handleUpdateQuestionBank();
  }, []);

  const handleUpdateQuestionBank = async () => {
    setIsUpdating(true);
    try {
      const success = await updateQuestionBank();
      if (success) {
        setLastUpdated(new Date());
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getFormattedDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loaderText}>Loading your data...</Text>
      </View>
    );
  }

  const categories: QuestionCategory[] = [
    'Algebra',
    'Geometry',
    'Reading Comprehension',
    'Grammar',
    'Vocabulary',
    'Data Analysis',
    'Trigonometry',
    'Essay Writing'
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Only show WebHeader on web platform */}
      {Platform.OS === 'web' && <WebHeader title="SAT Prep Dashboard" />}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? styles.webScrollView : undefined}
        contentContainerStyle={Platform.OS === 'web' ? styles.webContentContainer : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Student'}</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleUpdateQuestionBank}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="refresh" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.progressContainer}>
          <ProgressChart 
            mathScore={user?.progress.mathScore || 0} 
            verbalScore={user?.progress.verbalScore || 0}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Quizzes</Text>
              <Text style={styles.statValue}>{user?.progress.completedQuizzes || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>
                {user?.progress.totalAttempted 
                  ? Math.round((user.progress.totalCorrect / user.progress.totalAttempted) * 100) 
                  : 0}%
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Practice by Topic</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => 
                navigation.navigate('Practice', { selectedCategory: category })
              }
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {user?.weakAreas && user.weakAreas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <RecommendedTopics weakAreas={user.weakAreas as QuestionCategory[]} />
          </>
        )}

        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>
            Question bank last updated: {getFormattedDate(lastUpdated)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: Platform.OS === 'web' ? 0 : 16,
  },
  webScrollView: {
    padding: 0,
  },
  webContentContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 20,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  updateInfo: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  updateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default HomeScreen; 