import api from './apiService.js';
import { apiCallWithFallback } from '../utils/apiHelper.js';

// Mock functions
const mockPostRating = async (itemType, itemId, rating, comment) => {
  return {
    id: Date.now(),
    item_type: itemType,
    item_id: itemId,
    interaction_type: 'rating',
    rating: rating,
    comment: comment,
    created_at: new Date().toISOString()
  };
};

const mockFetchMyRatings = async () => {
  return [
    {
      id: 1,
      item_type: 'course',
      item_id: 1,
      interaction_type: 'rating',
      rating: 5,
      comment: 'Excellent course!',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      item_type: 'resource',
      item_id: 2,
      interaction_type: 'rating',
      rating: 4,
      comment: 'Very helpful resource',
      created_at: new Date().toISOString()
    }
  ];
};

/**
 * Post a rating for a course or resource
 */
export const postRating = async (itemType, itemId, rating, comment = null) => {
  const realApiCall = async () => {
    const response = await api.post('/api/interactions/rate', {
      item_type: itemType,
      item_id: itemId,
      rating: rating,
      comment: comment
    });
    return response.data;
  };

  const mockApiCall = async () => mockPostRating(itemType, itemId, rating, comment);
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Fetch all my ratings
 */
export const fetchMyRatings = async () => {
  const realApiCall = async () => {
    const response = await api.get('/api/interactions/my-ratings');
    return response.data;
  };

  const mockApiCall = async () => mockFetchMyRatings();
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Record a view interaction
 */
export const recordView = async (itemType, itemId) => {
  const realApiCall = async () => {
    const response = await api.post('/api/interactions/view', {
      item_type: itemType,
      item_id: itemId
    });
    return response.data;
  };

  const mockApiCall = async () => ({
    success: true,
    message: 'View recorded (mock)'
  });
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};
