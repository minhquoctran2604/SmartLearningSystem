// src/pages/khoa-hoc_index.jsx

import React, { useState, useMemo, useEffect } from "react";
import CourseCard from "../components/ui/CourseCard.jsx";
import { SearchIcon } from "../services/icons.jsx";
import { fetchCourses } from "../services/coursesService.js";

const CoursesListPage = ({ navigate, isLoggedIn }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả");
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const coursesData = await fetchCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const allSubjects = useMemo(
    () => ["Tất cả", ...new Set(courses.map((c) => c.subject))],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    let coursesToFilter = courses;

    if (selectedSubject !== "Tất cả") {
      coursesToFilter = coursesToFilter.filter((c) => c.subject === selectedSubject);
    }
    if (selectedLevel !== "Tất cả") {
      const levelNum = parseInt(selectedLevel);
      coursesToFilter = coursesToFilter.filter((c) => c.level === levelNum);
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm) {
      coursesToFilter = coursesToFilter.filter(
        (c) =>
          c.title.toLowerCase().includes(lowerSearchTerm) ||
          c.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return coursesToFilter;
  }, [searchTerm, selectedSubject, selectedLevel, courses]);

  return (
    <main className="min-h-screen pt-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
          Danh sách Khóa học
        </h1>

        {isLoading ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-600">Đang tải khóa học...</p>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-10 border border-indigo-100">
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học theo tiêu đề hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chủ đề
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 appearance-none bg-white"
                  >
                    {allSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cấp độ
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 appearance-none bg-white"
                  >
                    {["Tất cả", 1, 2, 3, 4, 5].map((level) => (
                      <option key={level} value={level}>
                        {level === "Tất cả" ? level : `Level ${level}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-700">
                  Kết quả tìm kiếm ({filteredCourses.length} khóa học)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      navigate={navigate}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-xl shadow-md">
                <p className="text-xl text-gray-600">
                  Không tìm thấy khóa học nào phù hợp với tiêu chí của bạn.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default CoursesListPage;
