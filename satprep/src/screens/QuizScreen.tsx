import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import context
import { UserContext } from '../context/UserContext';

// Import services
import { Question, getQuestions, getPassageById } from '../services/QuestionService';
import { QuestionCategory, QuestionDifficulty, UserPerformance } from '../services/AIService';

// Import navigation types
import { RootStackParamList } from '../navigation/types';

type QuizScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

const QuizScreen = () => {
  const navigation = useNavigation<QuizScreenNavigationProp>();
  const route = useRoute<QuizScreenRouteProp>();
  const { updateProgress } = useContext(UserContext);
  const params = route.params;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStartTime, setQuizStartTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
  const [results, setResults] = useState<{ correct: number; incorrect: number; skipped: number }>({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  
  const [passage, setPassage] = useState<string | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    // Load questions based on the quiz parameters
    const loadQuestions = async () => {
      try {
        if (params.useAI) {
          setIsGeneratingAI(true);
        }
        
        // In a real app, this would fetch from a back-end service
        const fetchedQuestions = await getQuestions({
          categories: [params.category],
          difficulty: params.difficulty,
          count: params.questionCount,
          useAI: params.useAI
        });
        
        // Check if this is a reading comprehension quiz that needs a passage
        if (params.category === 'Reading Comprehension' && fetchedQuestions.length > 0) {
          const firstQuestion = fetchedQuestions[0];
          // In a real app we would get the passage id from the question
          const passageData = getPassageById('passage001');
          
          if (passageData) {
            setPassage(passageData.content);
          }
        }
        
        setQuestions(fetchedQuestions);
        
        // Start the quiz timer
        const now = Date.now();
        setQuizStartTime(now);
        setQuestionStartTime(now);
        
        setIsGeneratingAI(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load questions', error);
        Alert.alert('Error', 'Failed to load questions. Please try again.');
        navigation.goBack();
      }
    };
    
    loadQuestions();
  }, [params, navigation]);

  useEffect(() => {
    // Update progress indicator
    Animated.timing(progressAnim, {
      toValue: (currentQuestionIndex + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Reset state for new question
    if (!isLoading) {
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      
      // Track time for new question
      const now = Date.now();
      if (currentQuestionIndex > 0) {
        const questionTime = (now - questionStartTime) / 1000;
        setTimePerQuestion(prev => [...prev, questionTime]);
      }
      setQuestionStartTime(now);
    }
  }, [currentQuestionIndex, questions.length, progressAnim, isLoading]);

  const handleSelectAnswer = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert('No Answer Selected', 'Please select an answer to continue.');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Update results
    setResults(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
    }));
    
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handleSkipQuestion = () => {
    // Record skipped question
    setResults(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
    }));
    
    // Track time for skipped question
    const now = Date.now();
    const questionTime = (now - questionStartTime) / 1000;
    setTimePerQuestion(prev => [...prev, questionTime]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    // Calculate total time spent on quiz
    const totalTime = (Date.now() - quizStartTime) / 1000;
    
    // Create performance data for AI analysis
    const performanceData: UserPerformance = {
      correctAnswers: results.correct,
      totalQuestions: questions.length,
      timeSpent: totalTime,
      category: params.category,
      difficulty: params.difficulty,
      incorrectQuestionIds: questions
        .filter((_, index) => {
          const result = index < results.correct + results.incorrect + results.skipped;
          if (!result) return false;
          
          const questionResult = index < results.correct ? true : false;
          return !questionResult;
        })
        .map(q => q.id),
    };
    
    // Update user progress with quiz results
    const isMathCategory = 
      params.category === 'Algebra' || 
      params.category === 'Geometry' || 
      params.category === 'Trigonometry' || 
      params.category === 'Data Analysis';
    
    updateProgress(
      isMathCategory ? 'math' : 'verbal',
      results.correct,
      questions.length
    );
    
    // Navigate to results screen
    navigation.navigate('Results', {
      results: {
        correct: results.correct,
        incorrect: results.incorrect,
        skipped: results.skipped,
        totalQuestions: questions.length,
        timeSpent: totalTime,
        averageTimePerQuestion: timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length,
      },
      performance: performanceData,
      quizType: params.quizType,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loaderText}>
          {isGeneratingAI 
            ? 'Generating AI-powered questions tailored to your skill level...'
            : 'Loading your quiz...'}
        </Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>No questions available for this quiz.</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.questionCounter}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <Text style={styles.category}>{currentQuestion.category}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            Alert.alert(
              'Quit Quiz',
              'Are you sure you want to quit? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Quit', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
            },
          ]}
        />
      </View>

      <ScrollView style={styles.contentContainer}>
        {passage && (
          <View style={styles.passageContainer}>
            <Text style={styles.passageTitle}>Reading Passage</Text>
            <Text style={styles.passageText}>{passage}</Text>
          </View>
        )}

        <View style={styles.questionContainer}>
          {currentQuestion.isAIGenerated && (
            <View style={styles.aiTag}>
              <Ionicons name="bulb-outline" size={14} color="#1e40af" />
              <Text style={styles.aiTagText}>AI-Generated</Text>
            </View>
          )}
          
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.selectedOption,
                  isAnswerSubmitted && index === currentQuestion.correctAnswer && styles.correctOption,
                  isAnswerSubmitted && selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOption,
                ]}
                onPress={() => handleSelectAnswer(index)}
                disabled={isAnswerSubmitted}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={[
                  styles.optionText,
                  isAnswerSubmitted && index === currentQuestion.correctAnswer && styles.correctOptionText,
                  isAnswerSubmitted && selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOptionText,
                ]}>
                  {option}
                </Text>
                {isAnswerSubmitted && index === currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" style={styles.resultIcon} />
                )}
                {isAnswerSubmitted && selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer && (
                  <Ionicons name="close-circle" size={20} color="#ef4444" style={styles.resultIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {isAnswerSubmitted && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        {!isAnswerSubmitted ? (
          <>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipQuestion}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, selectedAnswer === null && styles.disabledButton]}
              onPress={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  passageContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  passageText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 24,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  correctOption: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  incorrectOption: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  correctOptionText: {
    color: '#047857',
  },
  incorrectOptionText: {
    color: '#b91c1c',
  },
  resultIcon: {
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 16,
  },
  skipButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e40af',
    marginLeft: 4,
  },
});

export default QuizScreen; 