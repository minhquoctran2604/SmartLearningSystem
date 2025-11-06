import api from './apiService.js';
import { apiCallWithFallback } from '../utils/apiHelper.js';

// Mock functions
const mockFetchOverview = async (completedItems, enrolledCourses) => {
  return {
    total_courses: enrolledCourses || 0,
    completed_courses: completedItems || 0,
    total_lessons: 0,
    completed_lessons: 0,
    total_resources: 0,
    completed_resources: 0,
    total_time_minutes: Math.floor(Math.random() * 300),
    avg_quiz_score: Math.random() * 100,
    overall_completion_percentage: Math.random() * 100
  };
};

const mockFetchStats = async () => {
  return {
    total_time_minutes: Math.floor(Math.random() * 600),
    completed_courses: Math.floor(Math.random() * 5),
    completed_resources: Math.floor(Math.random() * 20),
    weekly_progress: [10, 20, 15, 25, 30, 22, 18],
    subject_distribution: {
      'Programming': 40,
      'Web Development': 30,
      'Data Science': 20,
      'Design': 10
    }
  };
};

/**
 * Fetch progress overview
 */
export const fetchProgressOverview = async (completedItems, enrolledCourses) => {
  const realApiCall = async () => {
    const response = await api.get('/api/progress/overview');
    return response.data;
  };

  const mockApiCall = async () => mockFetchOverview(completedItems, enrolledCourses);
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Fetch progress statistics
 */
export const fetchProgressStats = async (completedItems, enrolledCourses) => {
  const realApiCall = async () => {
    const response = await api.get('/api/progress/stats');
    return response.data;
  };

  const mockApiCall = async () => mockFetchStats();

  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Fetch in-progress items (courses with 0% < progress < 100%)
 */
export const fetchInProgressItems = async () => {
  const realApiCall = async () => {
    const response = await api.get('/api/progress/in-progress');
    return response.data;
  };

  const mockApiCall = async () => {
    // Mock data for testing
    return [
      {
        type: "Course",
        id: 1,
        title: "Python Programming Fundamentals",
        progress_percent: 45.5,
        completed_lessons: 5,
        total_lessons: 11,
        last_accessed: new Date().toISOString()
      },
      {
        type: "Course",
        id: 2,
        title: "Web Development with React",
        progress_percent: 30.0,
        completed_lessons: 3,
        total_lessons: 10,
        last_accessed: new Date(Date.now() - 86400000).toISOString() // Yesterday
      }
    ];
  };

  return apiCallWithFallback(realApiCall, mockApiCall);
};
