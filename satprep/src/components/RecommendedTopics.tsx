import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { QuestionCategory } from '../services/AIService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type RecommendedTopicsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface RecommendedTopicsProps {
  weakAreas: QuestionCategory[];
}

const RecommendedTopics: React.FC<RecommendedTopicsProps> = ({ weakAreas }) => {
  const navigation = useNavigation<RecommendedTopicsNavigationProp>();

  // Define resources for each weak area
  const getResourcesForCategory = (category: QuestionCategory) => {
    const resources: Record<string, {title: string, description: string, icon: string}[]> = {
      'Algebra': [
        {
          title: 'Linear Equations',
          description: 'Master the basics of linear equations and systems',
          icon: 'calculator-outline'
        },
        {
          title: 'Quadratic Functions',
          description: 'Practice solving quadratic equations and graphing parabolas',
          icon: 'analytics-outline'
        }
      ],
      'Geometry': [
        {
          title: 'Triangle Properties',
          description: 'Learn key properties of triangles and trigonometric ratios',
          icon: 'triangle-outline'
        },
        {
          title: 'Coordinate Geometry',
          description: 'Practice problems involving points, lines, and shapes on the coordinate plane',
          icon: 'grid-outline'
        }
      ],
      'Reading Comprehension': [
        {
          title: 'Main Idea Identification',
          description: 'Techniques for identifying main ideas and themes in passages',
          icon: 'book-outline'
        },
        {
          title: "Author's Purpose",
          description: 'Learn to identify why authors make certain choices in their writing',
          icon: 'help-circle-outline'
        }
      ],
      'Grammar': [
        {
          title: 'Subject-Verb Agreement',
          description: 'Review rules for matching subjects with their verbs',
          icon: 'text-outline'
        },
        {
          title: 'Pronoun Usage',
          description: 'Practice correct pronoun usage and references',
          icon: 'chatbubble-outline'
        }
      ],
      'Vocabulary': [
        {
          title: 'Context Clues',
          description: 'Learn to determine word meanings from context',
          icon: 'search-outline'
        },
        {
          title: 'Word Roots',
          description: 'Study common word roots to expand your vocabulary',
          icon: 'git-branch-outline'
        }
      ],
      'Data Analysis': [
        {
          title: 'Graph Interpretation',
          description: 'Practice interpreting data from various types of graphs',
          icon: 'bar-chart-outline'
        },
        {
          title: 'Statistical Measures',
          description: 'Learn to calculate and interpret mean, median, mode, and standard deviation',
          icon: 'stats-chart-outline'
        }
      ],
      'Trigonometry': [
        {
          title: 'Trigonometric Functions',
          description: 'Master the fundamentals of sine, cosine, and tangent',
          icon: 'pulse-outline'
        },
        {
          title: 'Right Triangle Trigonometry',
          description: 'Apply trigonometric ratios to solve problems',
          icon: 'analytics-outline'
        }
      ],
      'Essay Writing': [
        {
          title: 'Thesis Development',
          description: 'Learn to craft clear and compelling thesis statements',
          icon: 'document-text-outline'
        },
        {
          title: 'Evidence Integration',
          description: 'Practice incorporating evidence to support your arguments',
          icon: 'link-outline'
        }
      ]
    };

    return resources[category] || [];
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {weakAreas.map((area, index) => {
        const resources = getResourcesForCategory(area);
        return (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.cardHeader}>
              <Ionicons 
                name={
                  area.includes('Math') || area === 'Algebra' || area === 'Geometry' || area === 'Trigonometry' || area === 'Data Analysis'
                    ? 'calculator-outline'
                    : area.includes('Reading') || area === 'Vocabulary'
                    ? 'book-outline'
                    : area.includes('Grammar') || area === 'Essay Writing'
                    ? 'text-outline'
                    : 'school-outline'
                }
                size={20} 
                color="#3b82f6" 
              />
              <Text style={styles.cardTitle}>{area}</Text>
            </View>
            
            <Text style={styles.cardDescription}>
              Our AI analysis shows you need more practice in this area.
            </Text>
            
            <View style={styles.resourcesContainer}>
              {resources.map((resource, resourceIndex) => (
                <TouchableOpacity 
                  key={resourceIndex} 
                  style={styles.resourceItem}
                  onPress={() => {
                    navigation.navigate('Practice', { 
                      selectedCategory: area as QuestionCategory,
                      specificTopic: resource.title
                    });
                  }}
                >
                  <Ionicons name={resource.icon as any} size={16} color="#6b7280" />
                  <View style={styles.resourceTextContainer}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceDescription} numberOfLines={2}>
                      {resource.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.practiceButton}
              onPress={() => {
                navigation.navigate('Practice', { selectedCategory: area });
              }}
            >
              <Text style={styles.practiceButtonText}>Practice Now</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingRight: 16,
    paddingBottom: 8,
  },
  recommendationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginRight: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  resourcesContainer: {
    marginBottom: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  practiceButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  practiceButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  }
});

export default RecommendedTopics; 