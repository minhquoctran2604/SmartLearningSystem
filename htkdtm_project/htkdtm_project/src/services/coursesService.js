import api from './apiService.js';
import { apiCallWithFallback } from '../utils/apiHelper.js';

// Import mock functions từ courseMocks.jsx khi cần
// Tạm thời dùng simple mock
const mockFetchCourses = async () => {
    return [
        { id: 1, title: "Python cơ bản", description: "Học Python từ đầu", subject: "Programming", level: "Beginner" },
        { id: 2, title: "React nâng cao", description: "React cho chuyên gia", subject: "Web Development", level: "Advanced" }
    ];
};

const mockGetCourseById = async (id) => {
    return {
        id,
        title: "Course " + id,
        description: "Description for course " + id,
        subject: "Programming",
        level: "Intermediate",
        lessons: [
            { id: 1, title: "Lesson 1", duration: 30 },
            { id: 2, title: "Lesson 2", duration: 45 }
        ]
    };
};

/**
 * Fetch all courses
 */
export const fetchCourses = async () => {
    const realApiCall = async () => {
        const response = await api.get('/api/courses');
        return response.data;
    };

    const mockApiCall = async () => mockFetchCourses();

    return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Get course by ID
 */
export const getCourseById = async (id) => {
    const realApiCall = async () => {
        const response = await api.get(`/api/courses/${id}`);
        return response.data;
    };

    const mockApiCall = async () => mockGetCourseById(id);

    return apiCallWithFallback(realApiCall, mockApiCall);
};

/**
 * Enroll in a course
 */
export const enrollInCourse = async (courseId) => {
    const realApiCall = async () => {
        const response = await api.post(`/api/courses/${courseId}/enroll`);
        return response.data;
    };

    const mockApiCall = async () => {
        return { success: true, message: "Đã ghi danh thành công (mock)" };
    };

    return apiCallWithFallback(realApiCall, mockApiCall);
};
