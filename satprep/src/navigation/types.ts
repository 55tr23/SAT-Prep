import { QuestionCategory, QuestionDifficulty, UserPerformance } from '../services/AIService';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  WebLanding: undefined;
  Quiz: {
    quizType: string;
    category: QuestionCategory;
    difficulty: QuestionDifficulty;
    questionCount: number;
    specificTopic?: string;
    useAI?: boolean;
    isRecommendedQuiz?: boolean;
  };
  Results: {
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
  };
  Practice: {
    selectedCategory?: QuestionCategory;
    specificTopic?: string;
    category?: QuestionCategory;
    questionCount?: number;
    difficulty?: QuestionDifficulty;
    quizType?: string;
    useAI?: boolean;
  };
  Profile: undefined;
  Home: undefined;
  AIAnalysis: undefined;
  Progress: undefined;
  ApiKeys: undefined;
}; 