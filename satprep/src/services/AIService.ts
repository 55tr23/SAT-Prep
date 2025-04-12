// This service handles AI-based analysis and personalization using OpenAI's GPT-4o model
import axios from 'axios';
import { ApiKeyService } from './ApiKeyService';
import { ApiKeys, areApiKeysConfigured } from '../config/env';

// Types for question categories and difficulty
export type QuestionCategory = 
  'Algebra' | 
  'Geometry' | 
  'Trigonometry' | 
  'Data Analysis' | 
  'Reading Comprehension' | 
  'Vocabulary' | 
  'Grammar' | 
  'Essay Writing';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

// User performance metrics interface
export interface UserPerformance {
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  incorrectQuestionIds: string[];
}

// Recommendation interface
export interface StudyRecommendation {
  category: QuestionCategory;
  reason: string;
  recommendedResources: string[];
  recommendedQuestions: string[];
}

// New Question interface
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  createdAt: Date;
  isGenerated: boolean;
  source?: string; // Source of the information (e.g., URL, reference)
}

// Web search result interface
interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

/**
 * Gets API keys from secure storage
 */
const getApiKeys = async (): Promise<ApiKeys> => {
  return await ApiKeyService.getApiKeys();
};

/**
 * Checks if API keys are configured before making API calls
 */
const validateApiKeys = async (): Promise<boolean> => {
  const keys = await getApiKeys();
  return areApiKeysConfigured(keys);
};

/**
 * Analyzes user performance to identify strengths and weaknesses
 */
export const analyzePerformance = (performances: UserPerformance[]): Record<QuestionCategory, number> => {
  const performanceByCategory: Record<QuestionCategory, number> = {} as Record<QuestionCategory, number>;
  
  // Group performances by category and calculate success rate
  performances.forEach(perf => {
    const successRate = perf.correctAnswers / perf.totalQuestions;
    
    if (!performanceByCategory[perf.category] || successRate < performanceByCategory[perf.category]) {
      performanceByCategory[perf.category] = successRate;
    }
  });
  
  return performanceByCategory;
};

/**
 * Generates personalized study recommendations based on user performance
 */
export const generateRecommendations = (weakAreas: Record<QuestionCategory, number>): StudyRecommendation[] => {
  const recommendations: StudyRecommendation[] = [];
  
  Object.entries(weakAreas).forEach(([category, score]) => {
    if (score < 0.7) { // Focus on categories with < 70% success rate
      const recommendation: StudyRecommendation = {
        category: category as QuestionCategory,
        reason: `Your success rate of ${Math.round(score * 100)}% indicates room for improvement`,
        recommendedResources: getResourcesForCategory(category as QuestionCategory),
        recommendedQuestions: getMockQuestionIdsForCategory(category as QuestionCategory)
      };
      
      recommendations.push(recommendation);
    }
  });
  
  return recommendations;
};

/**
 * Gets resources for a specific category
 */
const getResourcesForCategory = (category: QuestionCategory): string[] => {
  // In a real app, these would be from your resources database
  return [
    `Resource 1 for ${category}`,
    `Resource 2 for ${category}`,
    `Resource 3 for ${category}`
  ];
};

/**
 * Gets mock question IDs for a specific category
 */
const getMockQuestionIdsForCategory = (category: QuestionCategory): string[] => {
  // In a real app, these would be actual question IDs from your database
  return ['q1001', 'q1002', 'q1003', 'q1004', 'q1005'];
};

/**
 * Creates mock questions for a specific category (used for fallback when API fails)
 */
const getMockQuestionsForCategory = (
  category: QuestionCategory, 
  difficulty: QuestionDifficulty, 
  count: number
): Question[] => {
  const questions: Question[] = [];
  
  for (let i = 0; i < count; i++) {
    const question: Question = {
      id: `gen_${Date.now()}_${i}`,
      question: `This is a sample ${category} question of ${difficulty} difficulty.`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'This is an explanation for the correct answer.',
      category,
      difficulty,
      createdAt: new Date(),
      isGenerated: true,
      source: "GPT-4o (Mock)"
    };
    
    questions.push(question);
  }
  
  return questions;
};

/**
 * Predicts the student's potential SAT score based on current performance
 */
export const predictSATScore = (
  mathPerformances: UserPerformance[],
  verbalPerformances: UserPerformance[]
): { mathScore: number; verbalScore: number; totalScore: number } => {
  // Calculate math section score (out of 800)
  const mathCorrect = mathPerformances.reduce((sum, perf) => sum + perf.correctAnswers, 0);
  const mathTotal = mathPerformances.reduce((sum, perf) => sum + perf.totalQuestions, 0);
  const mathPercentage = mathTotal > 0 ? mathCorrect / mathTotal : 0;
  const predictedMathScore = Math.round(mathPercentage * 800);

  // Calculate verbal section score (out of 800)
  const verbalCorrect = verbalPerformances.reduce((sum, perf) => sum + perf.correctAnswers, 0);
  const verbalTotal = verbalPerformances.reduce((sum, perf) => sum + perf.totalQuestions, 0);
  const verbalPercentage = verbalTotal > 0 ? verbalCorrect / verbalTotal : 0;
  const predictedVerbalScore = Math.round(verbalPercentage * 800);

  // Total score
  const totalScore = predictedMathScore + predictedVerbalScore;

  return {
    mathScore: predictedMathScore,
    verbalScore: predictedVerbalScore,
    totalScore
  };
};

/**
 * Searches the web for educational resources related to a category
 */
const searchForResources = async (category: QuestionCategory): Promise<string[]> => {
  try {
    // Check if API keys are configured
    const keysConfigured = await validateApiKeys();
    if (!keysConfigured) {
      throw new Error('API keys not configured');
    }
    
    const keys = await getApiKeys();
    
    // Make a real API call to Google Custom Search
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?key=${keys.search}&cx=${keys.searchEngineId}&q=SAT ${category} study resources`
    );
    
    return response.data.items.slice(0, 3).map((item: any) => 
      `${item.title} - ${item.link}`
    );
  } catch (error) {
    console.error('Error searching for resources:', error);
    return getMockResourcesForCategory(category);
  }
};

/**
 * Generates a personalized reason using AI
 */
const generateReasonWithAI = async (category: QuestionCategory, performances: UserPerformance[]): Promise<string> => {
  try {
    // Check if API keys are configured
    const keysConfigured = await validateApiKeys();
    if (!keysConfigured) {
      throw new Error('API keys not configured');
    }
    
    const keys = await getApiKeys();
    
    // Calculate performance metrics for this category
    const categoryPerformances = performances.filter(p => p.category === category);
    const correct = categoryPerformances.reduce((sum, p) => sum + p.correctAnswers, 0);
    const total = categoryPerformances.reduce((sum, p) => sum + p.totalQuestions, 0);
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    
    // Call the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an SAT tutor AI specialized in personalized learning recommendations."
          },
          {
            role: "user", 
            content: `Generate a brief personalized recommendation for why a student should focus on ${category}. 
                    Their accuracy in this category is ${percentage.toFixed(1)}%.`
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${keys.openai}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating reason with AI:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('OpenAI API Error:', error.response.data);
    }
    return `Your performance in ${category} shows room for improvement. Focus on strengthening your fundamentals in this area.`;
  }
};

/**
 * Generates AI-powered questions for a specific category and difficulty
 */
export const generateAIQuestions = async (
  category: QuestionCategory,
  difficulty: QuestionDifficulty,
  count: number = 5
): Promise<Question[]> => {
  try {
    // Check if API keys are configured
    const keysConfigured = await validateApiKeys();
    if (!keysConfigured) {
      throw new Error('API keys not configured');
    }
    
    const keys = await getApiKeys();
    
    // Get current SAT trends to make questions more relevant
    const trends = await searchForContentInsights(`current SAT ${category} trends`);
    
    // Create a detailed prompt for generating SAT questions
    const prompt = `Generate ${count} original SAT-style ${category} questions at ${difficulty} difficulty level.
    Each question should:
    1. Follow current SAT format (2024-2025)
    2. Have 4 answer choices (A, B, C, D)
    3. Include a clear explanation
    4. Be appropriate for the ${difficulty} difficulty level
    
    Consider these current trends in SAT ${category}:
    ${trends.join('\n')}
    
    Format as JSON array with objects having these properties: 
    question, options (array), correctAnswerIndex (0-3), explanation`;
    
    // Call the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a specialized SAT question generator that creates accurate, curriculum-aligned questions."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${keys.openai}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Parse the response and format questions
    const questionsData = JSON.parse(response.data.choices[0].message.content).questions;
    
    return questionsData.map((q: any, index: number) => ({
      id: `ai_${Date.now()}_${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswerIndex,
      explanation: q.explanation,
      category,
      difficulty,
      createdAt: new Date(),
      isGenerated: true,
      source: "GPT-4"
    }));
  } catch (error) {
    console.error('Error generating AI questions:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('OpenAI API Error:', error.response.data);
    }
    
    // Fallback to template-based questions if API fails
    return getMockQuestionsForCategory(category, difficulty, count);
  }
};

/**
 * Searches for content insights to make questions more relevant
 */
const searchForContentInsights = async (query: string): Promise<string[]> => {
  try {
    // Check if API keys are configured
    const keysConfigured = await validateApiKeys();
    if (!keysConfigured) {
      throw new Error('API keys not configured');
    }
    
    const keys = await getApiKeys();
    
    // Call Google Custom Search API
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?key=${keys.search}&cx=${keys.searchEngineId}&q=${encodeURIComponent(query)}`
    );
    
    return response.data.items.slice(0, 5).map((item: any) => 
      item.snippet || item.title
    );
  } catch (error) {
    console.error('Error searching for content insights:', error);
    return [
      'Focus on rational expressions and linear functions',
      'Data interpretation from graphs and tables is increasingly important',
      'Complex word problems with real-world contexts are common',
      'Multi-step problems requiring integration of concepts are featured',
      'Digital SAT format emphasizes efficiency and precision'
    ];
  }
};

/**
 * Refreshes the question bank with the latest SAT-aligned content
 */
export const refreshQuestionBank = async (): Promise<boolean> => {
  try {
    // Check if API keys are configured
    const keysConfigured = await validateApiKeys();
    if (!keysConfigured) {
      throw new Error('API keys not configured');
    }
    
    // Update progress (in a real app, this would connect to your backend)
    console.log('Refreshing question bank with latest content...');
    
    // Simulate API call to update question bank
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return success
    return true;
  } catch (error) {
    console.error('Error refreshing question bank:', error);
    return false;
  }
};

/**
 * Tracks updates to the SAT format and content areas
 */
export const trackSATUpdates = async (): Promise<{
  hasUpdates: boolean;
  latestFormat: string;
  updatedCategories: QuestionCategory[];
}> => {
  try {
    // Check if API keys are configured
    const keysConfigured = await validateApiKeys();
    if (!keysConfigured) {
      throw new Error('API keys not configured');
    }
    
    const keys = await getApiKeys();
    
    // In a production app, this would be a real API call to a service tracking SAT changes
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?key=${keys.search}&cx=${keys.searchEngineId}&q=latest SAT format changes`
    );
    
    // Process search results to extract updates
    const updatedCategories: QuestionCategory[] = [];
    
    // Just for demo - add random categories as "updated"
    if (Math.random() > 0.5) updatedCategories.push('Algebra');
    if (Math.random() > 0.5) updatedCategories.push('Reading Comprehension');
    
    return {
      hasUpdates: true,
      latestFormat: 'Digital SAT (2024-2025)',
      updatedCategories
    };
  } catch (error) {
    console.error('Error tracking SAT updates:', error);
    
    // Return mock data as fallback
    return {
      hasUpdates: false,
      latestFormat: 'Digital SAT (2024-2025)',
      updatedCategories: []
    };
  }
};

/**
 * Gets mock educational resources for a category
 */
const getMockResourcesForCategory = (category: QuestionCategory): string[] => {
  const resources: Record<QuestionCategory, string[]> = {
    'Algebra': [
      'Khan Academy - SAT Algebra Practice',
      'College Board - Official Algebra Review',
      'Princeton Review - Algebra SAT Strategies'
    ],
    'Geometry': [
      'Khan Academy - SAT Geometry Practice',
      'College Board - Official Geometry Review',
      'Princeton Review - Geometry SAT Strategies'
    ],
    'Trigonometry': [
      'Khan Academy - SAT Trigonometry Practice',
      'College Board - Official Trigonometry Review',
      'Princeton Review - Trigonometry SAT Strategies'
    ],
    'Data Analysis': [
      'Khan Academy - SAT Data Analysis Practice',
      'College Board - Official Data Analysis Review',
      'Princeton Review - Data Analysis SAT Strategies'
    ],
    'Reading Comprehension': [
      'Khan Academy - SAT Reading Practice',
      'College Board - Official Reading Review',
      'Princeton Review - Reading SAT Strategies'
    ],
    'Vocabulary': [
      'Khan Academy - SAT Vocabulary Practice',
      'College Board - Official Vocabulary Review',
      'Princeton Review - Vocabulary SAT Strategies'
    ],
    'Grammar': [
      'Khan Academy - SAT Grammar Practice',
      'College Board - Official Grammar Review',
      'Princeton Review - Grammar SAT Strategies'
    ],
    'Essay Writing': [
      'Khan Academy - SAT Writing Practice',
      'College Board - Official Writing Review',
      'Princeton Review - Writing SAT Strategies'
    ]
  };
  
  return resources[category] || [
    'Khan Academy - SAT Practice',
    'College Board - Official SAT Review',
    'Princeton Review - SAT Strategies'
  ];
};

/**
 * Gets an advanced question template for generating realistic SAT questions
 */
const getAdvancedQuestionTemplate = (
  category: QuestionCategory, 
  difficulty: QuestionDifficulty,
  trends: string[]
): {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
} => {
  // This template system could be expanded in a real app
  switch (category) {
    case 'Algebra':
      if (difficulty === 'Hard') {
        return {
          question: "The function f(x) = ax² + bx + c has zeros at x = 3 and x = -2. If f(1) = -10, what is the value of a?",
          options: ["-2", "-1", "1", "2"],
          correctAnswer: 0,
          explanation: "Since 3 and -2 are zeros, we know that f(x) = a(x-3)(x+2). Expanding, we get f(x) = a(x²-x-6). When x = 1, f(1) = a(1-1-6) = -6a = -10, so a = 5/3."
        };
      } else {
        return {
          question: "Solve for x: 2(x + 3) = 5x - 4",
          options: ["2", "10/3", "2/3", "5"],
          correctAnswer: 1,
          explanation: "2(x + 3) = 5x - 4\n2x + 6 = 5x - 4\n6 + 4 = 5x - 2x\n10 = 3x\nx = 10/3"
        };
      }
      
    case 'Reading Comprehension':
      if (difficulty === 'Hard') {
        return {
          question: `Based on the passage, the author's primary purpose is to:`,
          options: [
            "argue that traditional educational methods are superior to modern approaches",
            "analyze the historical development of educational philosophy",
            "propose a new framework for understanding learning differences",
            "challenge prevailing assumptions about cognitive development"
          ],
          correctAnswer: 3,
          explanation: "The author consistently questions established theories about how children learn and develop cognitively, providing evidence that contradicts conventional wisdom."
        };
      } else {
        return {
          question: "According to the passage, which statement best describes the author's view of technology?",
          options: [
            "It is fundamentally changing how we process information",
            "It is a temporary trend that will soon be replaced",
            "It has limited impact on educational outcomes",
            "It should be avoided in classroom settings"
          ],
          correctAnswer: 0,
          explanation: "The author repeatedly emphasizes how technological tools are reshaping our cognitive processes and learning methods."
        };
      }
      
    // Add other categories as needed...
    
    default:
      return {
        question: `This is a sample ${category} question of ${difficulty} difficulty that incorporates: ${trends[0] || 'standard concepts'}.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'This is an explanation for the correct answer.'
      };
  }
};

/**
 * Gets question templates by category
 */
const getQuestionTemplateByCategory = (
  category: QuestionCategory, 
  difficulty: QuestionDifficulty
): {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
} => {
  // This function could be expanded with more template examples
  
  switch (category) {
    case 'Algebra':
      return {
        question: "Solve for x: 3x + 5 = 20",
        options: ["3", "5", "7", "15"],
        correctAnswer: 1,
        explanation: "3x + 5 = 20\n3x = 15\nx = 5"
      };
    
    case 'Geometry':
      return {
        question: "What is the area of a circle with radius 4?",
        options: ["4π", "8π", "12π", "16π"],
        correctAnswer: 3,
        explanation: "The area of a circle is πr². With r = 4, the area is π(4)² = 16π."
      };
    
    case 'Reading Comprehension':
      return {
        question: "Based on the passage, what can be inferred about the author's view on climate policy?",
        options: [
          "It requires immediate international cooperation",
          "It should be determined by individual nations",
          "It is less urgent than economic concerns",
          "It has been addressed adequately by current measures"
        ],
        correctAnswer: 0,
        explanation: "Throughout the passage, the author emphasizes the need for collaborative international efforts to address climate challenges effectively."
      };
    
    default:
      return {
        question: `This is a sample ${category} question.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'This is an explanation for the correct answer.'
      };
  }
}; 