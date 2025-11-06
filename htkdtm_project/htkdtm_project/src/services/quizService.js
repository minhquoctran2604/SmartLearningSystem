import api from './apiService.js';
import { apiCallWithFallback } from '../utils/apiHelper.js';

// Mock functions
const mockFetchQuiz = async (lessonId) => ({
  id: lessonId,
  lesson_id: lessonId,
  title: `Quiz ${lessonId}`,
  passing_score: 70,
  questions: [
    {
      id: 1,
      text: "Placeholder question 1",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: "Option A"
    },
    {
      id: 2,
      text: "Placeholder question 2",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: "Option B"
    }
  ]
});

const mockSubmitQuiz = async () => ({
  score: 80,
  correct_answers: 2,
  total_questions: 2,
  passed: true
});

/**
 * Fetch quiz by ID
 * Returns null if quiz doesn't exist (no mock fallback)
 */
export const fetchQuiz = async (lessonId) => {
  try {
    const response = await api.get(`/api/quizzes/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    console.error('Quiz lookup failed:', error);
    return mockFetchQuiz(lessonId);
  }
};

/**
 * Submit quiz answers
 */
export const submitQuiz = async (quizId, lessonId, answers) => {
  const realApiCall = async () => {
    const response = await api.post(`/api/quizzes/${quizId}/submit/${lessonId}`, { answers });
    return response.data;
  };

  const mockApiCall = async () => mockSubmitQuiz();
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};
