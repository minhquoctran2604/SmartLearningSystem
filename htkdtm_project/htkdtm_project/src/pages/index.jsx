// src/pages/index.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header.jsx";
import Footer from "../components/layout/Footer.jsx";
import CourseCard from "../components/ui/CourseCard.jsx";
import ResourceCard from "../components/ui/ResourceCard.jsx";
import { BookOpenIcon } from "../services/icons.jsx";
import { fetchPopularCourses, fetchPersonalizedMixed, fetchRecentResources } from "../services/recommendationService.js";

const HomeHero = ({ navigate, isLoggedIn }) => (
  <div className="bg-indigo-50 pt-20 pb-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-6xl font-extrabold text-gray-900 tracking-tighter sm:text-7xl lg:text-8xl animate-fade-in">
        Chào mừng đến với <span className="text-indigo-600">SmartLearn</span>
      </h1>
      <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-200">
        {isLoggedIn 
          ? "Các khóa học được đề xuất dành riêng cho bạn dựa trên sở thích và tiến độ học tập."
          : "Học tập mọi lúc, mọi nơi. Nâng cao kỹ năng và đạt được mục tiêu sự nghiệp của bạn với các khóa học chất lượng cao."
        }
      </p>
      <div className="mt-10 animate-scale-in delay-400">
        <button
          onClick={() => navigate("courses")}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-300 transform hover:translate-y-[-2px] transition duration-300 ease-in-out"
        >
          <BookOpenIcon className="w-6 h-6 mr-2" /> <p>Duyệt tất cả khóa học</p>
        </button>
      </div>
    </div>
  </div>
);

const HomePage = ({ navigate, isLoggedIn, completedItems, enrolledCourses }) => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [personalizedCourses, setPersonalizedCourses] = useState([]);
  const [personalizedResources, setPersonalizedResources] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const popular = await fetchPopularCourses(6);
        setPopularCourses(popular);

        if (isLoggedIn) {
          console.log('📊 Fetching personalized mixed recommendations...');
          const personalized = await fetchPersonalizedMixed(3, 3);
          console.log('✅ Personalized data received:', personalized);
          console.log('  - Courses:', personalized.courses?.length || 0);
          console.log('  - Resources:', personalized.resources?.length || 0);
          setPersonalizedCourses(personalized.courses || []);
          setPersonalizedResources(personalized.resources || []);
        } else {
          setPersonalizedCourses([]);
          setPersonalizedResources([]);
        }

        const resources = await fetchRecentResources(5);
        setRecentResources(resources);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [isLoggedIn]);

  return (
    <>
      <main className="min-h-screen pt-16">
        <HomeHero navigate={navigate} isLoggedIn={isLoggedIn} />

        {loading ? (
          <div className="text-center py-20 text-indigo-600 text-xl">Đang tải khóa học...</div>
        ) : (
          <>
            {console.log('🔍 Render check - isLoggedIn:', isLoggedIn, 'courses:', personalizedCourses.length, 'resources:', personalizedResources.length)}
            {isLoggedIn && (personalizedCourses.length > 0 || personalizedResources.length > 0) && (
              <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                    🎯 <span className="text-indigo-600">Đề xuất dành cho bạn</span>
                  </h2>
                  <p className="text-center text-gray-600 mb-8">
                    Dựa trên sở thích và lịch sử học tập của bạn (AI Recommendation)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {personalizedCourses.map((course) => (
                      <CourseCard
                        key={`course-${course.id}`}
                        course={course}
                        navigate={navigate}
                      />
                    ))}
                    {personalizedResources.map((resource) => (
                      <ResourceCard
                        key={`resource-${resource.id}`}
                        resource={resource}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                  🔥 <span className="text-orange-600">Khóa học Nổi bật</span>
                </h2>
                <p className="text-center text-gray-600 mb-8">
                  Các khóa học được nhiều người quan tâm nhất
                </p>
                {popularCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {popularCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Không có khóa học nào được tìm thấy</p>
                )}
              </div>
            </section>

            <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                  📚 <span className="text-purple-600">Video mới nhất</span>
                </h2>
                <p className="text-center text-gray-600 mb-8">
                  Top 5 video học tập được cập nhật gần đây
                </p>
                {recentResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recentResources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Không có video nào được tìm thấy</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
};

export default HomePage;
