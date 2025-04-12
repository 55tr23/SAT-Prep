import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for the user data
interface UserData {
  id: string;
  name: string;
  email: string;
  progress: {
    mathScore: number;
    verbalScore: number;
    completedQuizzes: number;
    totalCorrect: number;
    totalAttempted: number;
  };
  weakAreas: string[];
  strengths: string[];
}

// Define the context type
interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProgress: (section: 'math' | 'verbal', score: number, total: number) => void;
  setWeakAreas: (areas: string[]) => void;
  setStrengths: (areas: string[]) => void;
}

// Create initial user state
const initialUserState: UserData = {
  id: '',
  name: '',
  email: '',
  progress: {
    mathScore: 0,
    verbalScore: 0,
    completedQuizzes: 0,
    totalCorrect: 0,
    totalAttempted: 0,
  },
  weakAreas: [],
  strengths: [],
};

// Create context with default values
export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  updateProgress: () => {},
  setWeakAreas: () => {},
  setStrengths: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Mock login function - would connect to a real API in production
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      // In a real app, this would be a call to your authentication service
      const mockUser: UserData = {
        ...initialUserState,
        id: '1',
        name: 'Test User',
        email,
      };

      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const updateProgress = async (section: 'math' | 'verbal', correct: number, total: number) => {
    if (!user) return;

    try {
      const newUser = { ...user };
      
      if (section === 'math') {
        newUser.progress.mathScore = Math.round(
          (newUser.progress.mathScore * newUser.progress.completedQuizzes + (correct / total) * 100) / 
          (newUser.progress.completedQuizzes + 1)
        );
      } else {
        newUser.progress.verbalScore = Math.round(
          (newUser.progress.verbalScore * newUser.progress.completedQuizzes + (correct / total) * 100) / 
          (newUser.progress.completedQuizzes + 1)
        );
      }
      
      newUser.progress.completedQuizzes += 1;
      newUser.progress.totalCorrect += correct;
      newUser.progress.totalAttempted += total;
      
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const setWeakAreas = async (areas: string[]) => {
    if (!user) return;

    try {
      const newUser = { ...user, weakAreas: areas };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to set weak areas', error);
    }
  };

  const setStrengths = async (areas: string[]) => {
    if (!user) return;

    try {
      const newUser = { ...user, strengths: areas };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to set strengths', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateProgress,
        setWeakAreas,
        setStrengths,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}; 