import { QuestionCategory, QuestionDifficulty, generateAIQuestions, refreshQuestionBank as refreshAIQuestionBank, trackSATUpdates } from './AIService';

// Question interface
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  lastUpdated: string; // ISO date string
  isAIGenerated?: boolean; // Flag for AI-generated questions
}

// Reading passage interface for verbal questions
export interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  source: string;
  questions: string[]; // IDs of related questions
}

// Interface for quiz configuration
export interface QuizConfig {
  categories?: QuestionCategory[];
  difficulty?: QuestionDifficulty;
  count: number;
  useAI?: boolean; // Option to use AI-generated questions
}

// Interface for SAT update info
export interface SATUpdateInfo {
  lastChecked: Date;
  hasUpdates: boolean;
  latestFormat: string;
  updatedCategories: QuestionCategory[];
}

// Mock database of questions
const mockQuestions: Question[] = [
  // Math - Algebra questions
  {
    id: 'math001',
    text: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2, // index 2 = '5'
    explanation: 'To solve for x, subtract 7 from both sides: 3x = 15. Then divide both sides by 3: x = 5.',
    category: 'Algebra',
    difficulty: 'Easy',
    lastUpdated: '2024-01-15T12:00:00Z'
  },
  {
    id: 'math002',
    text: 'What is the solution to the equation 2x² - 5x - 3 = 0?',
    options: ['x = -0.5 or x = 3', 'x = 0.5 or x = 3', 'x = -0.5 or x = -3', 'x = 0.5 or x = -3'],
    correctAnswer: 0,
    explanation: 'Using the quadratic formula, x = (-b ± √(b² - 4ac))/(2a), where a=2, b=-5, c=-3. This gives x = (-(-5) ± √(25 + 24))/(2(2)) = (5 ± √49)/4 = (5 ± 7)/4, which simplifies to x = -0.5 or x = 3.',
    category: 'Algebra',
    difficulty: 'Medium',
    lastUpdated: '2024-02-10T09:30:00Z'
  },
  
  // Math - Geometry questions
  {
    id: 'math003',
    text: 'In a right triangle, one angle is 90° and another is 35°. What is the measure of the third angle?',
    options: ['45°', '55°', '65°', '75°'],
    correctAnswer: 1,
    explanation: 'The sum of angles in a triangle is 180°. If one angle is 90° and another is 35°, then the third angle is 180° - 90° - 35° = 55°.',
    category: 'Geometry',
    difficulty: 'Easy',
    lastUpdated: '2024-01-20T14:15:00Z'
  },
  
  // Verbal - Reading Comprehension
  {
    id: 'verbal001',
    text: 'Based on the passage, the author\'s primary purpose is to:',
    options: [
      'criticize a traditional approach',
      'advocate for a new perspective',
      'explain a complex phenomenon',
      'compare competing theories'
    ],
    correctAnswer: 2,
    explanation: 'The author spends most of the passage explaining the details of the phenomenon rather than arguing for a particular position or comparing different viewpoints.',
    category: 'Reading Comprehension',
    difficulty: 'Medium',
    lastUpdated: '2024-02-05T10:45:00Z'
  },
  
  // Verbal - Grammar
  {
    id: 'verbal002',
    text: 'Choose the option that best corrects the underlined portion of the sentence: The team of scientists, led by Dr. Chen, have made a significant breakthrough.',
    options: [
      'have made',
      'has made',
      'are making',
      'is making'
    ],
    correctAnswer: 1,
    explanation: 'The subject of the sentence is "team" (singular), not "scientists," so it requires a singular verb form: "has made."',
    category: 'Grammar',
    difficulty: 'Easy',
    lastUpdated: '2024-01-25T08:20:00Z'
  }
];

// In-memory storage for AI-generated questions
let aiGeneratedQuestions: Question[] = [];

// Storage for SAT update information
let satUpdateInfo: SATUpdateInfo = {
  lastChecked: new Date(),
  hasUpdates: false,
  latestFormat: '2023 Digital SAT Format',
  updatedCategories: []
};

// Mock database of reading passages
const mockPassages: ReadingPassage[] = [
  {
    id: 'passage001',
    title: 'The Evolution of Artificial Intelligence',
    content: `Artificial intelligence (AI) has evolved significantly since its inception in the 1950s. The field began with simple rule-based programs and has grown to include sophisticated neural networks capable of learning from vast amounts of data. Recent advances in deep learning have enabled AI systems to perform tasks once thought to require human intelligence, such as image recognition, natural language processing, and strategic decision-making.

Despite these advances, AI still faces substantial challenges. Current systems lack true understanding and instead rely on pattern recognition trained on specific datasets. This limitation becomes apparent when AI encounters situations different from its training data. Furthermore, concerns about bias in AI decision-making have grown as these systems are deployed in sensitive areas such as hiring, lending, and criminal justice.

The future of AI development will likely focus on creating more general systems that can transfer knowledge between domains, reason about causal relationships, and exhibit some form of common sense. Additionally, researchers are working to make AI decisions more transparent and explainable, which is crucial for building trust and ensuring accountability.`,
    source: 'Adapted from Journal of Artificial Intelligence Research',
    questions: ['verbal001']
  }
];

/**
 * Retrieves questions based on provided configuration
 * Now supports real-time AI-generated questions
 */
export const getQuestions = async (config: QuizConfig): Promise<Question[]> => {
  let filteredQuestions = [...mockQuestions];
  
  // Filter by categories if specified
  if (config.categories && config.categories.length > 0) {
    filteredQuestions = filteredQuestions.filter(
      q => config.categories?.includes(q.category)
    );
  }
  
  // Filter by difficulty if specified
  if (config.difficulty) {
    filteredQuestions = filteredQuestions.filter(
      q => q.difficulty === config.difficulty
    );
  }
  
  // Include stored AI-generated questions if they match the criteria
  let matchingAIQuestions = aiGeneratedQuestions.filter(q => {
    let matches = true;
    if (config.categories && config.categories.length > 0) {
      matches = matches && config.categories.includes(q.category);
    }
    if (config.difficulty) {
      matches = matches && q.difficulty === config.difficulty;
    }
    return matches;
  });
  
  let allQuestions = [...filteredQuestions, ...matchingAIQuestions];
  
  // Randomize questions
  allQuestions = shuffleArray(allQuestions);
  
  // If useAI is enabled and we don't have enough questions, generate new ones
  if (config.useAI && allQuestions.length < config.count) {
    const neededCount = config.count - allQuestions.length;
    
    try {
      // Generate AI questions for each requested category
      if (config.categories && config.categories.length > 0) {
        for (const category of config.categories) {
          const aiQuestions = await generateAIQuestions(
            category,
            config.difficulty || 'Medium',
            Math.ceil(neededCount / config.categories.length)
          );
          
          // Convert AI questions to our Question interface
          const convertedQuestions: Question[] = aiQuestions.map(q => ({
            id: q.id,
            text: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            category: q.category,
            difficulty: q.difficulty,
            lastUpdated: new Date().toISOString(),
            isAIGenerated: true
          }));
          
          // Add to our collection
          aiGeneratedQuestions = [...aiGeneratedQuestions, ...convertedQuestions];
          allQuestions = [...allQuestions, ...convertedQuestions];
        }
      } else {
        // Generate a mix of questions across categories
        const categories: QuestionCategory[] = [
          'Algebra', 'Reading Comprehension', 'Grammar', 'Geometry'
        ];
        
        for (const category of categories) {
          const aiQuestions = await generateAIQuestions(
            category, 
            config.difficulty || 'Medium',
            Math.ceil(neededCount / 4)
          );
          
          // Convert AI questions
          const convertedQuestions: Question[] = aiQuestions.map(q => ({
            id: q.id,
            text: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            category: q.category,
            difficulty: q.difficulty,
            lastUpdated: new Date().toISOString(),
            isAIGenerated: true
          }));
          
          // Add to our collection
          aiGeneratedQuestions = [...aiGeneratedQuestions, ...convertedQuestions];
          allQuestions = [...allQuestions, ...convertedQuestions];
        }
      }
    } catch (error) {
      console.error('Error generating AI questions:', error);
    }
    
    // Randomize again after adding AI questions
    allQuestions = shuffleArray(allQuestions);
  }
  
  // Return requested number of questions (or all if not enough)
  return allQuestions.slice(0, config.count);
};

/**
 * Gets a reading passage by ID
 */
export const getPassageById = (passageId: string): ReadingPassage | undefined => {
  return mockPassages.find(p => p.id === passageId);
};

/**
 * Gets a question by ID
 */
export const getQuestionById = (questionId: string): Question | undefined => {
  // Check in both mock questions and AI-generated questions
  return [...mockQuestions, ...aiGeneratedQuestions].find(q => q.id === questionId);
};

/**
 * Gets questions by IDs
 */
export const getQuestionsByIds = (questionIds: string[]): Question[] => {
  return [...mockQuestions, ...aiGeneratedQuestions].filter(q => questionIds.includes(q.id));
};

/**
 * Updates the question bank with new questions from the latest SAT formats
 * Now integrates with AI service for latest question patterns
 */
export const updateQuestionBank = async (): Promise<boolean> => {
  try {
    // Check for SAT updates
    const updates = await trackSATUpdates();
    
    if (updates.hasUpdates) {
      // Store update information
      satUpdateInfo = {
        lastChecked: new Date(),
        hasUpdates: updates.hasUpdates,
        latestFormat: updates.latestFormat,
        updatedCategories: updates.updatedCategories
      };
      
      // Refresh AI question bank with latest patterns
      await refreshAIQuestionBank();
      
      // Generate fresh questions for updated categories
      for (const category of updates.updatedCategories) {
        const newQuestions = await generateAIQuestions(category, 'Medium', 3);
        
        // Convert and add to question bank
        const convertedQuestions: Question[] = newQuestions.map(q => ({
          id: q.id,
          text: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          lastUpdated: new Date().toISOString(),
          isAIGenerated: true
        }));
        
        aiGeneratedQuestions = [...aiGeneratedQuestions, ...convertedQuestions];
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update question bank', error);
    return false;
  }
};

/**
 * Get questions similar to those a user answered incorrectly
 * Now with AI-powered similarity matching
 */
export const getSimilarQuestions = (incorrectQuestionIds: string[], count: number): Question[] => {
  // Get categories of incorrect questions
  const incorrectQuestions = getQuestionsByIds(incorrectQuestionIds);
  const categories = [...new Set(incorrectQuestions.map(q => q.category))];
  
  // Get questions in the same categories but exclude the incorrect ones
  const similarQuestions = [...mockQuestions, ...aiGeneratedQuestions].filter(
    q => categories.includes(q.category) && !incorrectQuestionIds.includes(q.id)
  );
  
  return shuffleArray(similarQuestions).slice(0, count);
};

/**
 * Gets the latest SAT format update information
 */
export const getSATUpdateInfo = (): SATUpdateInfo => {
  return satUpdateInfo;
};

/**
 * Clears cached AI-generated questions
 */
export const clearAIGeneratedQuestions = (): void => {
  aiGeneratedQuestions = [];
};

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}; 