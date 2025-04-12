import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import context and components
import { UserContext } from '../context/UserContext';
import ProgressChart from '../components/ProgressChart';
import SkillMasteryCard from '../components/SkillMasteryCard';
import { RootStackParamList } from '../navigation/types';
import { QuestionCategory, QuestionDifficulty } from '../services/AIService';

// Define types for mastery levels
type MasteryLevel = 'not-started' | 'familiar' | 'proficient' | 'mastered';

// Skills interface for skill items
interface SkillItem {
  id: string;
  name: string;
  category: QuestionCategory;
  mastery: MasteryLevel;
  progress: number;
  practicedAt?: Date;
}

// Mock completion data for demonstration
const getMockSkills = (): SkillItem[] => {
  return [
    { 
      id: '1', 
      name: 'Linear Equations', 
      category: 'Algebra', 
      mastery: 'proficient', 
      progress: 75,
      practicedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '2', 
      name: 'Quadratic Equations', 
      category: 'Algebra', 
      mastery: 'familiar', 
      progress: 40,
      practicedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '3', 
      name: 'Coordinate Geometry', 
      category: 'Geometry', 
      mastery: 'mastered', 
      progress: 95,
      practicedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '4', 
      name: 'Trigonometric Functions', 
      category: 'Trigonometry', 
      mastery: 'not-started', 
      progress: 0,
    },
    { 
      id: '5', 
      name: 'Reading Comprehension', 
      category: 'Reading Comprehension', 
      mastery: 'familiar', 
      progress: 35,
      practicedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '6', 
      name: 'Vocabulary Context', 
      category: 'Vocabulary', 
      mastery: 'proficient', 
      progress: 70,
      practicedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '7', 
      name: 'Data Analysis', 
      category: 'Data Analysis', 
      mastery: 'familiar', 
      progress: 45,
      practicedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '8', 
      name: 'Grammar Rules', 
      category: 'Grammar', 
      mastery: 'proficient', 
      progress: 80,
      practicedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) 
    },
  ];
};

// Mock recent activity data
const getMockRecentActivity = () => {
  return [
    {
      id: '1',
      type: 'quiz',
      title: 'Algebra Quiz',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      score: 80,
      category: 'Algebra' as QuestionCategory,
    },
    {
      id: '2',
      type: 'practice',
      title: 'Geometry Practice',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      score: 65,
      category: 'Geometry' as QuestionCategory,
    },
    {
      id: '3',
      type: 'quiz',
      title: 'Reading Comprehension',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      score: 75,
      category: 'Reading Comprehension' as QuestionCategory,
    },
  ];
};

// Get formatted date string
const getFormattedDate = (date: Date): string => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Navigation type
type ProgressScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Progress'>;

const ProgressScreen = () => {
  const navigation = useNavigation<ProgressScreenNavigationProp>();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<'math' | 'verbal'>('math');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for skills and activity
  const allSkills = getMockSkills();
  const recentActivity = getMockRecentActivity();
  
  // Filter skills based on active tab
  const filteredSkills = allSkills.filter(skill => {
    const mathCategories = ['Algebra', 'Geometry', 'Trigonometry', 'Data Analysis'];
    const verbalCategories = ['Reading Comprehension', 'Vocabulary', 'Grammar', 'Essay Writing'];
    
    if (activeTab === 'math') {
      return mathCategories.includes(skill.category);
    } else {
      return verbalCategories.includes(skill.category);
    }
  });

  // Launch practice session
  const handlePracticeSkill = (skill: SkillItem) => {
    navigation.navigate('Practice', {
      category: skill.category,
      questionCount: 5,
      difficulty: skill.mastery === 'not-started' || skill.mastery === 'familiar' 
        ? 'Easy' 
        : skill.mastery === 'proficient' 
          ? 'Medium' 
          : 'Hard' as QuestionDifficulty,
      quizType: 'practice',
      useAI: true
    });
  };

  // Launch quiz for a specific category
  const handleStartQuiz = (category: QuestionCategory) => {
    navigation.navigate('Quiz', {
      category,
      questionCount: 10,
      difficulty: 'Medium' as QuestionDifficulty,
      quizType: 'standard',
      useAI: false
    });
  };

  // Render skill item using SkillMasteryCard
  const renderSkillItem = ({ item }: { item: SkillItem }) => (
    <SkillMasteryCard
      id={item.id}
      name={item.name}
      category={item.category}
      mastery={item.mastery}
      progress={item.progress}
      practicedAt={item.practicedAt}
      onPress={() => handlePracticeSkill(item)}
    />
  );

  // Render activity item
  const renderActivityItem = ({ item }: { item: any }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <Ionicons 
          name={item.type === 'quiz' ? 'school-outline' : 'barbell-outline'} 
          size={18} 
          color="#3b82f6" 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDate}>{getFormattedDate(item.date)}</Text>
      </View>
      <View style={styles.activityScore}>
        <Text style={[
          styles.scoreText, 
          { color: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444' }
        ]}>
          {item.score}%
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Progress</Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressChart 
          mathScore={user?.progress.mathScore || 0} 
          verbalScore={user?.progress.verbalScore || 0}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'math' && styles.activeTabButton]}
          onPress={() => setActiveTab('math')}
        >
          <Text 
            style={[styles.tabButtonText, activeTab === 'math' && styles.activeTabButtonText]}
          >
            Math
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'verbal' && styles.activeTabButton]}
          onPress={() => setActiveTab('verbal')}
        >
          <Text 
            style={[styles.tabButtonText, activeTab === 'verbal' && styles.activeTabButtonText]}
          >
            Verbal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills Progress</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter-outline" size={18} color="#6b7280" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading your skills progress...</Text>
            </View>
          ) : filteredSkills.length > 0 ? (
            <FlatList
              data={filteredSkills}
              renderItem={renderSkillItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>
                No skills progress found for this section yet.
                Start practicing to track your progress!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {recentActivity.length > 0 ? (
            <FlatList
              data={recentActivity}
              renderItem={renderActivityItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>
                No recent activity found.
                Complete quizzes to see your activity here!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Practice</Text>
          
          <View style={styles.recommendationContainer}>
            <TouchableOpacity 
              style={styles.recommendationItem}
              onPress={() => handleStartQuiz(activeTab === 'math' ? 'Algebra' : 'Reading Comprehension')}
            >
              <View style={styles.recommendationIconContainer}>
                <Ionicons 
                  name={activeTab === 'math' ? 'calculator-outline' : 'book-outline'} 
                  size={24} 
                  color="#ffffff" 
                />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>
                  {activeTab === 'math' ? 'Algebra Quiz' : 'Reading Comprehension Quiz'}
                </Text>
                <Text style={styles.recommendationDescription}>
                  {activeTab === 'math' 
                    ? 'Improve your algebra skills to boost your math score' 
                    : 'Strengthen your reading comprehension abilities'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.recommendationItem}
              onPress={() => handleStartQuiz(activeTab === 'math' ? 'Geometry' : 'Grammar')}
            >
              <View style={[
                styles.recommendationIconContainer, 
                { backgroundColor: '#f59e0b' }
              ]}>
                <Ionicons 
                  name={activeTab === 'math' ? 'analytics-outline' : 'text-outline'} 
                  size={24} 
                  color="#ffffff" 
                />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>
                  {activeTab === 'math' ? 'Geometry Quiz' : 'Grammar Quiz'}
                </Text>
                <Text style={styles.recommendationDescription}>
                  {activeTab === 'math' 
                    ? 'Master geometric concepts and problem-solving' 
                    : 'Review grammar rules and common errors'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    maxWidth: '80%',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityScore: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationContainer: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  recommendationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default ProgressScreen; 