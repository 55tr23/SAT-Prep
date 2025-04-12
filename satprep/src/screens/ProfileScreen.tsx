import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Import context
import { UserContext } from '../context/UserContext';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const { user, logout } = useContext(UserContext);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  const [dailyReminders, setDailyReminders] = useState(true);
  const [studyGoalMinutes, setStudyGoalMinutes] = useState(30);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Call the logout function from context
            logout();
          } 
        },
      ]
    );
  };
  
  const handleToggleReminders = () => {
    setDailyReminders(!dailyReminders);
  };
  
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, this would trigger a theme change
    Alert.alert('Theme Change', 'Dark mode will be implemented in the next update.');
  };
  
  const handleChangeStudyGoal = (direction: 'increase' | 'decrease') => {
    if (direction === 'increase') {
      setStudyGoalMinutes(prev => Math.min(prev + 15, 120));
    } else {
      setStudyGoalMinutes(prev => Math.max(prev - 15, 15));
    }
  };

  const navigateToApiKeys = () => {
    navigation.navigate('ApiKeys');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Your Profile</Text>
        </View>
        
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'student@example.com'}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.progress.completedQuizzes || 0}</Text>
              <Text style={styles.statLabel}>Quizzes</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round((user?.progress.mathScore || 0) + (user?.progress.verbalScore || 0)) / 2}%
              </Text>
              <Text style={styles.statLabel}>Avg. Score</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.strengths?.length || 0}</Text>
              <Text style={styles.statLabel}>Strengths</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              <Text style={styles.preferenceLabel}>Daily Study Reminders</Text>
            </View>
            <Switch
              value={dailyReminders}
              onValueChange={handleToggleReminders}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={dailyReminders ? '#ffffff' : '#f3f4f6'}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.preferenceLabel}>Daily Study Goal</Text>
            </View>
            <View style={styles.studyGoalContainer}>
              <TouchableOpacity
                style={styles.studyGoalButton}
                onPress={() => handleChangeStudyGoal('decrease')}
              >
                <Ionicons name="remove" size={20} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.studyGoalText}>{studyGoalMinutes} minutes</Text>
              <TouchableOpacity
                style={styles.studyGoalButton}
                onPress={() => handleChangeStudyGoal('increase')}
              >
                <Ionicons name="add" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="moon-outline" size={20} color="#6b7280" />
              <Text style={styles.preferenceLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 12,
  },
  studyGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 4,
  },
  studyGoalButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  studyGoalText: {
    fontSize: 14,
    color: '#4b5563',
    marginHorizontal: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ProfileScreen; 