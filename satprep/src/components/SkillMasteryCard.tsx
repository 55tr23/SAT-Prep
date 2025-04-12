import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuestionCategory } from '../services/AIService';

type MasteryLevel = 'not-started' | 'familiar' | 'proficient' | 'mastered';

interface SkillMasteryCardProps {
  id: string;
  name: string;
  category: QuestionCategory;
  mastery: MasteryLevel;
  progress: number;
  practicedAt?: Date;
  onPress: () => void;
}

// Helper function to get formatted date string
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

// Helper function to get mastery color
const getMasteryColor = (mastery: MasteryLevel): string => {
  switch (mastery) {
    case 'mastered':
      return '#10b981'; // green
    case 'proficient':
      return '#3b82f6'; // blue
    case 'familiar':
      return '#f59e0b'; // amber
    case 'not-started':
    default:
      return '#9ca3af'; // gray
  }
};

// Helper function to get mastery icon
const getMasteryIcon = (mastery: MasteryLevel): React.ComponentProps<typeof Ionicons>['name'] => {
  switch (mastery) {
    case 'mastered':
      return 'checkmark-circle'; 
    case 'proficient':
      return 'star';
    case 'familiar':
      return 'sparkles-outline';
    case 'not-started':
    default:
      return 'ellipse-outline';
  }
};

// Helper function to get lesson count based on mastery
const getLessonCount = (mastery: MasteryLevel): number => {
  switch (mastery) {
    case 'mastered':
      return 5;
    case 'proficient':
      return 3;
    case 'familiar':
      return 1;
    case 'not-started':
    default:
      return 0;
  }
};

const SkillMasteryCard: React.FC<SkillMasteryCardProps> = ({
  name,
  category,
  mastery,
  progress,
  practicedAt,
  onPress
}) => {
  const masteryColor = getMasteryColor(mastery);
  const masteryIcon = getMasteryIcon(mastery);
  const completedLessons = getLessonCount(mastery);
  const totalLessons = 5; // Total number of lessons to master a skill
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={[styles.masteryBadge, { backgroundColor: masteryColor }]}>
          <Text style={styles.masteryText}>
            {mastery === 'not-started' ? 'Not Started' :
             mastery === 'familiar' ? 'Familiar' :
             mastery === 'proficient' ? 'Proficient' : 'Mastered'}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progress}%`, backgroundColor: masteryColor }
          ]} 
        />
      </View>
      
      <View style={styles.skillInfo}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{category}</Text>
          {practicedAt && (
            <Text style={styles.practiceDate}>
              Practiced {getFormattedDate(practicedAt)}
            </Text>
          )}
        </View>
        
        <View style={styles.lessonIndicatorContainer}>
          {Array.from({ length: totalLessons }).map((_, index) => (
            <View 
              key={index}
              style={[
                styles.lessonIndicator,
                index < completedLessons 
                  ? { backgroundColor: masteryColor } 
                  : { backgroundColor: '#e5e7eb' }
              ]}
            >
              {index < completedLessons && (
                <Ionicons 
                  name={index === completedLessons - 1 ? masteryIcon : 'checkmark'}
                  size={10} 
                  color="#ffffff" 
                />
              )}
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <View style={styles.masteryIconContainer}>
          <Ionicons name={masteryIcon} size={18} color={masteryColor} />
        </View>
        <Text style={[styles.actionText, { color: masteryColor }]}>
          {mastery === 'not-started' 
            ? 'Start learning' 
            : mastery === 'mastered' 
              ? 'Review mastered skill' 
              : 'Continue practice'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  masteryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  masteryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  skillInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  practiceDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  lessonIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  masteryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SkillMasteryCard; 