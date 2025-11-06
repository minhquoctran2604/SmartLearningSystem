import api from './apiService.js';
import { apiCallWithFallback } from '../utils/apiHelper.js';

// Mock fallback data
const mockFetchResources = async () => {
  return [
    {
      id: 1,
      title: "Python Documentation",
      type: "pdf",
      url: "https://docs.python.org/3/",
      description: "Official Python documentation"
    },
    {
      id: 2,
      title: "React Tutorial Video",
      type: "video",
      url: "https://reactjs.org/tutorial",
      description: "Interactive React tutorial"
    },
    {
      id: 3,
      title: "JavaScript Guide",
      type: "pdf",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      description: "MDN JavaScript Guide"
    }
  ];
};

const mockGetResourceById = async (id) => {
  return {
    id: id,
    title: "Resource " + id,
    type: "pdf",
    url: "https://example.com/resource-" + id,
    description: "Description for resource " + id,
    content: "# Resource Content\n\nThis is the content of the resource."
  };
};

/**
 * Fetch all resources
 */
export const fetchResources = async () => {
  const realApiCall = async () => {
    const response = await api.get('/api/resources');
    return response.data;
  };

  const mockApiCall = async () => mockFetchResources();
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Get resource by ID
 */
export const getResourceById = async (id) => {
  const realApiCall = async () => {
    const response = await api.get(`/api/resources/${id}`);
    return response.data;
  };

  const mockApiCall = async () => mockGetResourceById(id);
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Mark resource as completed
 */
export const markResourceCompleted = async (resourceId) => {
  const realApiCall = async () => {
    const response = await api.post(`/api/resources/${resourceId}/complete`);
    return response.data;
  };

  const mockApiCall = async () => {
    console.log(`Mock: Marked resource ${resourceId} as completed`);
    return { success: true, message: "Resource marked as completed (mock)" };
  };
  
  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Get resource progress for current user
 */
export const getResourceProgress = async (resourceId) => {
  const realApiCall = async () => {
    const response = await api.get(`/api/progress/resources/${resourceId}`);
    return response.data;
  };

  const mockApiCall = async () => {
    console.log(`Mock: Getting resource ${resourceId} progress`);
    return { 
      resource_id: resourceId,
      watch_percent: 0,
      time_spent: 0,
      completed: false,
      last_accessed: null
    };
  };

  return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Update resource progress
 */
export const updateResourceProgress = async (resourceId, payload) => {
  const realApiCall = async () => {
    const response = await api.post(`/api/resources/${resourceId}/progress`, payload);
    return response.data;
  };

  const mockApiCall = async () => {
    console.log(`Mock: Tracking resource ${resourceId} progress`, payload);
    return { success: true, ...payload };
  };

  return apiCallWithFallback(realApiCall, mockApiCall);
};
