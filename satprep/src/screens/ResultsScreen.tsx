import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import context
import { UserContext } from '../context/UserContext';

// Import services and types
import { UserPerformance, analyzePerformance, generateRecommendations, StudyRecommendation } from '../services/AIService';
import { getSimilarQuestions, Question } from '../services/QuestionService';

interface ResultsParams {
  results: {
    correct: number;
    incorrect: number;
    skipped: number;
    totalQuestions: number;
    timeSpent: number;
    averageTimePerQuestion: number;
  };
  performance: UserPerformance;
  quizType: string;
}

const ResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, setWeakAreas } = useContext(UserContext);
  const params = route.params as ResultsParams;
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [weakAreas, setLocalWeakAreas] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [similarQuestions, setSimilarQuestions] = useState<Question[]>([]);
  
  // Calculate score and percentages
  const percentCorrect = Math.round((params.results.correct / params.results.totalQuestions) * 100);
  const percentIncorrect = Math.round((params.results.incorrect / params.results.totalQuestions) * 100);
  const percentSkipped = Math.round((params.results.skipped / params.results.totalQuestions) * 100);
  
  useEffect(() => {
    // Simulate AI analysis with a slight delay
    const timer = setTimeout(() => {
      // Analyze performance and generate recommendations
      const detectedWeakAreas = analyzePerformance([params.performance]);
      const studyRecommendations = generateRecommendations(detectedWeakAreas, [params.performance]);
      
      // Get similar questions for future practice
      const similarQs = getSimilarQuestions(params.performance.incorrectQuestionIds, 5);
      
      setLocalWeakAreas(detectedWeakAreas);
      setRecommendations(studyRecommendations);
      setSimilarQuestions(similarQs);
      
      // Update user context with detected weak areas
      if (setWeakAreas && detectedWeakAreas.length > 0) {
        setWeakAreas(detectedWeakAreas);
      }
      
      setIsAnalyzing(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [params.performance, setWeakAreas]);
  
  // Format time from seconds to minutes:seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Determine score color based on percentage
  const getScoreColor = (percent: number): string => {
    if (percent < 50) return '#ef4444'; // red
    if (percent < 70) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };
  
  // Generate a personalized feedback message
  const getFeedbackMessage = (): string => {
    if (percentCorrect >= 80) {
      return 'Excellent work! You have a strong understanding of the material.';
    } else if (percentCorrect >= 60) {
      return 'Good job! Keep practicing to improve your understanding.';
    } else {
      return 'Keep practicing! Focus on the areas identified below to improve your score.';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz Results</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Ionicons name="home" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scorePercent, { color: getScoreColor(percentCorrect) }]}>
              {percentCorrect}%
            </Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>
          
          <Text style={styles.feedbackMessage}>{getFeedbackMessage()}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{params.results.correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{params.results.incorrect}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{params.results.skipped}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          </View>
          
          <View style={styles.timeStats}>
            <View style={styles.timeStatItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.timeStatText}>
                Total time: {formatTime(params.results.timeSpent)}
              </Text>
            </View>
            <View style={styles.timeStatItem}>
              <Ionicons name="timer-outline" size={16} color="#6b7280" />
              <Text style={styles.timeStatText}>
                Avg. per question: {formatTime(params.results.averageTimePerQuestion)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Analyzing your performance...</Text>
            </View>
          ) : (
            <>
              <View style={styles.weakAreasContainer}>
                <Text style={styles.subsectionTitle}>Areas to Improve</Text>
                
                {weakAreas.length > 0 ? (
                  weakAreas.map((area, index) => (
                    <View key={index} style={styles.weakAreaItem}>
                      <Ionicons name="alert-circle-outline" size={20} color="#f59e0b" />
                      <Text style={styles.weakAreaText}>{area}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyMessage}>
                    No specific areas of weakness detected.
                  </Text>
                )}
              </View>
              
              {recommendations.length > 0 && (
                <View style={styles.recommendationsContainer}>
                  <Text style={styles.subsectionTitle}>Recommended Study Topics</Text>
                  
                  {recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Text style={styles.recommendationTitle}>{rec.category}</Text>
                      <Text style={styles.recommendationReason}>{rec.reason}</Text>
                      
                      <View style={styles.resourcesList}>
                        <Text style={styles.resourcesTitle}>Resources:</Text>
                        {rec.recommendedResources.map((resource, rIndex) => (
                          <View key={rIndex} style={styles.resourceItem}>
                            <Ionicons name="book-outline" size={16} color="#3b82f6" />
                            <Text style={styles.resourceText}>{resource}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
              
              {similarQuestions.length > 0 && (
                <View style={styles.similarQuestionsContainer}>
                  <Text style={styles.subsectionTitle}>Practice These Similar Questions</Text>
                  
                  <TouchableOpacity
                    style={styles.practiceButton}
                    onPress={() => {
                      // Navigate to a new quiz with similar questions
                      navigation.navigate('Quiz', {
                        quizType: 'practice',
                        category: params.performance.category,
                        difficulty: params.performance.difficulty,
                        questionCount: similarQuestions.length,
                        isRecommendedQuiz: true,
                      });
                    }}
                  >
                    <Text style={styles.practiceButtonText}>
                      Start Practice Quiz
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
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
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scoreSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scorePercent: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  feedbackMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeStats: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  timeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeStatText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  analysisSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  weakAreasContainer: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  weakAreaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  weakAreaText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  recommendationsContainer: {
    marginBottom: 24,
  },
  recommendationItem: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  resourcesList: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  resourcesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  similarQuestionsContainer: {
    marginBottom: 8,
  },
  practiceButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  practiceButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
});

export default ResultsScreen; 