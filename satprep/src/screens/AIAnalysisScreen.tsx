import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import context
import { UserContext } from '../context/UserContext';

// Import services and components
import { predictSATScore, UserPerformance } from '../services/AIService';
import ProgressChart from '../components/ProgressChart';

// Mock performance data (would come from user's activity history in a real app)
const generateMockPerformanceData = (): UserPerformance[] => {
  const categories = [
    'Algebra', 'Geometry', 'Data Analysis', 'Reading Comprehension', 
    'Vocabulary', 'Grammar'
  ];
  
  const performanceData: UserPerformance[] = [];
  
  // Generate a few random performance entries
  for (let i = 0; i < 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)] as any;
    const isMath = ['Algebra', 'Geometry', 'Data Analysis'].includes(category);
    
    performanceData.push({
      correctAnswers: Math.floor(Math.random() * 8) + 3, // 3-10 correct answers
      totalQuestions: 10,
      timeSpent: (Math.random() * 600) + 300, // 5-15 minutes in seconds
      category,
      difficulty: Math.random() > 0.5 ? 'Medium' : 'Easy',
      incorrectQuestionIds: [],
    });
  }
  
  return performanceData;
};

const AIAnalysisScreen = () => {
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [predictedScore, setPredictedScore] = useState({ mathScore: 0, verbalScore: 0, totalScore: 0 });
  const [timeSpentData, setTimeSpentData] = useState({ 
    math: 0, 
    verbal: 0, 
    total: 0 
  });
  const [performanceByDay, setPerformanceByDay] = useState<Record<string, { 
    correct: number; 
    total: number; 
    accuracyPercent: number; 
  }>>({});
  
  useEffect(() => {
    // Simulate AI analysis with a delay
    const timer = setTimeout(() => {
      // Mock user performance data
      const performanceData = generateMockPerformanceData();
      
      // Separate math and verbal performances
      const mathPerformances = performanceData.filter(p => 
        ['Algebra', 'Geometry', 'Data Analysis', 'Trigonometry'].includes(p.category)
      );
      
      const verbalPerformances = performanceData.filter(p => 
        ['Reading Comprehension', 'Vocabulary', 'Grammar', 'Essay Writing'].includes(p.category)
      );
      
      // Predict SAT score
      const prediction = predictSATScore(mathPerformances, verbalPerformances);
      setPredictedScore(prediction);
      
      // Calculate time spent studying
      const mathTime = mathPerformances.reduce((sum, p) => sum + p.timeSpent, 0);
      const verbalTime = verbalPerformances.reduce((sum, p) => sum + p.timeSpent, 0);
      setTimeSpentData({
        math: Math.round(mathTime / 60), // convert to minutes
        verbal: Math.round(verbalTime / 60),
        total: Math.round((mathTime + verbalTime) / 60),
      });
      
      // Generate fake day-by-day performance data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayPerformance: Record<string, { correct: number; total: number; accuracyPercent: number }> = {};
      
      days.forEach(day => {
        const correct = Math.floor(Math.random() * 20) + 5;
        const total = correct + Math.floor(Math.random() * 10);
        dayPerformance[day] = {
          correct,
          total,
          accuracyPercent: Math.round((correct / total) * 100),
        };
      });
      
      setPerformanceByDay(dayPerformance);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Our AI is analyzing your performance...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Analytics</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your SAT Score Prediction</Text>
          <Text style={styles.predictionSubtitle}>
            Based on your current performance, we predict your SAT score would be:
          </Text>
          
          <View style={styles.predictionContainer}>
            <View style={styles.totalScoreContainer}>
              <Text style={styles.totalScoreValue}>
                {formatNumber(predictedScore.totalScore)}
              </Text>
              <Text style={styles.totalScoreLabel}>Predicted Total</Text>
            </View>
            
            <View style={styles.scoreBreakdown}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{formatNumber(predictedScore.mathScore)}</Text>
                <Text style={styles.scoreLabel}>Math</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{formatNumber(predictedScore.verbalScore)}</Text>
                <Text style={styles.scoreLabel}>Verbal</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.predictionNote}>
            This prediction is based on your quiz performance and will become more accurate as you complete more practice.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Overview</Text>
          
          <View style={styles.progressContainer}>
            <ProgressChart 
              mathScore={user?.progress.mathScore || 0}
              verbalScore={user?.progress.verbalScore || 0}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Time Analysis</Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <View style={[styles.timeIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="time-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.timeValue}>{timeSpentData.total} mins</Text>
              <Text style={styles.timeLabel}>Total Study Time</Text>
            </View>
            
            <View style={styles.timeBreakdown}>
              <View style={styles.timeDetailItem}>
                <View style={[styles.timeDetailIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="calculator-outline" size={16} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.timeDetailValue}>{timeSpentData.math} mins</Text>
                  <Text style={styles.timeDetailLabel}>Math</Text>
                </View>
              </View>
              
              <View style={styles.timeDetailItem}>
                <View style={[styles.timeDetailIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="book-outline" size={16} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.timeDetailValue}>{timeSpentData.verbal} mins</Text>
                  <Text style={styles.timeDetailLabel}>Verbal</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance This Week</Text>
          
          <View style={styles.weeklyContainer}>
            {Object.entries(performanceByDay).map(([day, data]) => (
              <View key={day} style={styles.dayItem}>
                <Text style={styles.dayLabel}>{day}</Text>
                <View style={styles.accuracyBarContainer}>
                  <View 
                    style={[
                      styles.accuracyBar, 
                      { height: `${data.accuracyPercent}%` },
                      data.accuracyPercent < 50 ? styles.lowAccuracy : 
                      data.accuracyPercent < 75 ? styles.mediumAccuracy : 
                      styles.highAccuracy
                    ]} 
                  />
                </View>
                <Text style={styles.accuracyLabel}>{data.accuracyPercent}%</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Object.values(performanceByDay).reduce((sum, day) => sum + day.correct, 0)}
              </Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Object.values(performanceByDay).reduce((sum, day) => sum + day.total, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(
                  Object.values(performanceByDay).reduce((sum, day) => sum + day.accuracyPercent, 0) / 
                  Object.keys(performanceByDay).length
                )}%
              </Text>
              <Text style={styles.statLabel}>Avg. Accuracy</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          
          <View style={styles.recommendationContainer}>
            <View style={styles.recommendationHeader}>
              <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
              <Text style={styles.recommendationTitle}>Focus Areas</Text>
            </View>
            
            <Text style={styles.recommendationText}>
              Based on your recent performance, our AI recommends focusing on the following areas:
            </Text>
            
            <View style={styles.recommendationList}>
              {user?.weakAreas && user.weakAreas.length > 0 ? (
                user.weakAreas.map((area, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.recommendationItemText}>{area}</Text>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.recommendationItemText}>
                      Algebraic expressions and equations
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.recommendationItemText}>
                      Reading comprehension techniques
                    </Text>
                  </View>
                </>
              )}
            </View>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Personalized Study Plan</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
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
  predictionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  predictionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  totalScoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoreBreakdown: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  predictionNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeItem: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeBreakdown: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  timeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  dayItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  accuracyBarContainer: {
    height: 120,
    width: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  accuracyBar: {
    width: '100%',
    borderRadius: 8,
  },
  lowAccuracy: {
    backgroundColor: '#ef4444',
  },
  mediumAccuracy: {
    backgroundColor: '#f59e0b',
  },
  highAccuracy: {
    backgroundColor: '#10b981',
  },
  accuracyLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  recommendationContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  recommendationList: {
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationItemText: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
});

export default AIAnalysisScreen;