// src/App.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
// Pages
import HomePage from "./pages/index.jsx";
import LoginPage from "./pages/dang-nhap.jsx";
import CoursesListPage from "./pages/khoa-hoc_index.jsx";
import CourseDetailPage from "./pages/courses/[id].jsx";
import LessonViewerPage from "./pages/bai-hoc/[id].jsx";
import ResourceBrowsePage from "./pages/tai-nguyen_index.jsx";
import ResourceDetailPage from "./pages/resources/[id].jsx";
import DashboardPage from "./pages/dashboard.jsx";
// Services
import { fetchMyRatings } from "./services/interactionsService.js";

const App = () => {
  const [page, setPage] = useState("home");
  const [courseId, setCourseId] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [resourceId, setResourceId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setAuthData] = useState(null);

  const [completedItems, setCompletedItems] = useState({
    lessons: [],
    resources: [],
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // User ratings state
  const [userRatings, setUserRatings] = useState([]);

  const navigate = useCallback((targetPage, id = null) => {
    setPage(targetPage);
    
    // Preserve courseId when navigating to lesson-viewer
    if (targetPage !== "lesson-viewer") {
      setCourseId(null);
    }
    
    setLessonId(null);
    setResourceId(null);

    if (targetPage === "course-detail") {
      setCourseId(id);
    }
    if (targetPage === "lesson-viewer") {
      setLessonId(id);
    }
    if (targetPage === "resource-detail") {
      setResourceId(id);
    }
    window.scrollTo(0, 0);
  }, []);

  // Update completion status
  const updateCompletion = useCallback((type, id) => {
    const idNum = parseInt(id);
    setCompletedItems((prev) => {
      const list = prev[type] || [];
      if (!list.includes(idNum)) {
        return { ...prev, [type]: [...list, idNum] };
      }
      return prev;
    });
  }, []);

  // Enroll in course
  const enrollCourse = useCallback((courseId) => {
    const idNum = parseInt(courseId);
    setEnrolledCourses((prev) => {
      if (!prev.includes(idNum)) {
        return [...prev, idNum];
      }
      return prev;
    });
  }, []);

  // Update user ratings
  const updateRating = useCallback((itemId, itemType, rating) => {
    const idNum = parseInt(itemId);
    setUserRatings((prevRatings) => {
      const filteredRatings = prevRatings.filter(
        (r) => r.itemId !== idNum || r.itemType !== itemType
      );
      return [
        ...filteredRatings,
        {
          itemId: idNum,
          itemType,
          rating,
          timestamp: new Date().toISOString()
        }
      ];
    });
  }, []);

  // Load user ratings on app start and after login
  const loadUserRatings = useCallback(async () => {
    try {
      const ratingsData = await fetchMyRatings();
      const transformedRatings = ratingsData.map(rating => ({
        itemId: rating.id,
        itemType: rating.type,
        rating: rating.rating,
        timestamp: rating.date
      }));
      setUserRatings(transformedRatings);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  }, []);

  // Load ratings on app startup
  useEffect(() => {
    const token = localStorage.getItem('smartlearn_token');
    if (token) {
      setIsLoggedIn(true);
      loadUserRatings();
    }
  }, [loadUserRatings]);

  // Login success handler
  const handleLoginSuccess = useCallback(async (userData) => {
    setIsLoggedIn(true);
    setAuthData(userData);
    await loadUserRatings();
  }, [loadUserRatings]);

  // Logout handler
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setAuthData(null);
    setUserRatings([]);
    setCompletedItems({ lessons: [], resources: [] });
    setEnrolledCourses([]);
    localStorage.removeItem('smartlearn_token');
    navigate('home');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        currentPage={page}
        navigate={navigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage navigate={navigate} />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/courses" element={<CoursesListPage navigate={navigate} />} />
          <Route path="/course/:id" element={<CourseDetailPage navigate={navigate} />} />
          <Route path="/lesson/:id" element={
            <LessonViewerPage
              lessonId={lessonId}
              navigate={navigate}
              isLoggedIn={isLoggedIn}
              updateCompletion={updateCompletion}
            />
          } />
          <Route path="/resources" element={<ResourceBrowsePage navigate={navigate} />} />
          <Route path="/resource/:id" element={
            <ResourceDetailPage
              resourceId={resourceId}
              navigate={navigate}
              isLoggedIn={isLoggedIn}
              userRatings={userRatings}
              updateRating={updateRating}
              updateCompletion={updateCompletion}
            />
          } />
          <Route path="/dashboard" element={
            <DashboardPage
              navigate={navigate}
              isLoggedIn={isLoggedIn}
              completedItems={completedItems}
              enrolledCourses={enrolledCourses}
              userRatings={userRatings}
            />
          } />
        </Routes>
      </main>

      <Footer navigate={navigate} />
    </div>
  );
};

export default App;