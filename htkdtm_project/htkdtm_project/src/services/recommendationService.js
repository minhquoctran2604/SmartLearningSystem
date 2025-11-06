/**
 * Recommendation Service - Real API Integration
 * Calls backend SVD-based recommendation endpoints
 */

import api from './apiService';

/**
 * Fetch popular courses (no authentication required)
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} Popular courses
 */
export const fetchPopularCourses = async (limit = 5) => {
  try {
    const response = await api.get(`/api/recommendations/courses/popular?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    return [];
  }
};

/**
 * Fetch personalized course recommendations (requires authentication)
 * Uses SVD collaborative filtering model
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} Recommended courses
 */
export const fetchPersonalizedRecommendations = async (limit = 5) => {
  try {
    const response = await api.get(`/api/recommendations/courses?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    // Return empty array on error (user might not have history)
    return [];
  }
};

/**
 * Fetch mixed personalized recommendations (courses + resources)
 * @param {number} courseLimit - Number of courses (default 3)
 * @param {number} resourceLimit - Number of resources (default 3)
 * @returns {Promise<Object>} Object with courses and resources arrays
 */
export const fetchPersonalizedMixed = async (courseLimit = 3, resourceLimit = 3) => {
  try {
    console.log(`🔍 Calling /api/recommendations/personalized with courseLimit=${courseLimit}, resourceLimit=${resourceLimit}`);
    const response = await api.get(
      `/api/recommendations/personalized?course_limit=${courseLimit}&resource_limit=${resourceLimit}`
    );
    console.log('✅ API Response:', response.data);
    return response.data; // { courses: [...], resources: [...] }
  } catch (error) {
    console.error('❌ Error fetching mixed personalized recommendations:', error);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return { courses: [], resources: [] };
  }
};

/**
 * Fetch recent resources for homepage (no authentication required)
 * @param {number} limit - Number of resources to fetch
 * @returns {Promise<Array>} Recent resources
 */
export const fetchRecentResources = async (limit = 5) => {
  try {
    const response = await api.get(`/api/recommendations/resources?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent resources:', error);
    return [];
  }
};
