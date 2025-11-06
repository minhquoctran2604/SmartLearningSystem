import api from './apiService.js';
import { apiCallWithFallback } from '../utils/apiHelper.js';

// Mock fallback data
const mockFetchLessonDetails = async (lessonId) => {
  return {
    id: lessonId,
    title: "Introduction to Python",
    content: "# Welcome to Python\n\nPython is a powerful programming language...\n\n## Topics covered:\n- Variables\n- Data types\n- Functions",
    type: "reading",
    videoUrl: null,
    duration: 15,
    completed: false,
    courseId: 1
  };
};

const mockUpdateLessonProgress = async (lessonId, progressData) => {
  console.log(`Mock: Updated lesson ${lessonId} progress:`, progressData);
  return { success: true, message: "Progress updated (mock)" };
};

const mockFetchLessonProgress = async (lessonId) => {
  return {
    lesson_id: lessonId,
    completed: false,
    video_progress_percent: 0,
    reading_completed: false
  };
};

/**
 * Fetch lesson details
 */
export const fetchLessonDetails = async (lessonId) => {
  const realApiCall = async () => {
    const response = await api.get(`/api/lessons/${lessonId}`);
    return response.data;
  };

  const mockApiCall = async () => mockFetchLessonDetails(lessonId);
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Update lesson progress (general endpoint)
 * @param {number} lessonId
 * @param {object} progressData - { video_watched_percent?, time_spent?, video_completed?, reading_completed? }
 */
export const updateLessonProgress = async (lessonId, progressData) => {
  const realApiCall = async () => {
    // If this is specifically video progress, use the dedicated video endpoint
    if (progressData.video_watched_percent !== undefined || progressData.video_completed !== undefined) {
      const response = await api.post(`/api/lessons/${lessonId}/progress/video`, progressData);
      return response.data;
    }

    // Otherwise use the general progress endpoint
    const response = await api.post(`/api/lessons/${lessonId}/progress`, progressData);
    return response.data;
  };

  const mockApiCall = async () => mockUpdateLessonProgress(lessonId, progressData);

  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Get lesson progress for current user
 */
export const fetchLessonProgress = async (lessonId) => {
  const realApiCall = async () => {
    const response = await api.get(`/api/lessons/${lessonId}/progress`);
    return response.data;
  };

  const mockApiCall = async () => mockFetchLessonProgress(lessonId);
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Mark reading as completed
 */
export const markReadingCompleted = async (lessonId) => {
  try {
    const response = await api.post(`/api/lessons/${lessonId}/progress/reading`);
    console.log(`✅ Reading completed for lesson ${lessonId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error marking reading completed:`, error);
    throw error;
  }
};
