// src/pages/courses/[id].jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import MessageBox from "../../components/ui/MessageBox.jsx";
import RatingStars from "../../components/ui/RatingStars.jsx";
import {
  ListIcon,
  UsersIcon,
  ClockIcon,
  ZapIcon,
  XIcon,
} from "../../services/icons.jsx";
import { getLevelColor } from "../../services/utils.js";
import { fetchAISummary } from "../../services/geminiApi.js";
import { postRating } from "../../services/interactionsService.js";
import { getCourseById } from "../../services/coursesService.js";
import { getCourseThumbnail, imageErrorFallback } from "../../utils/getCourseThumbnail.js";

const CourseDetailPage = ({
  courseId,
  navigate,
  isLoggedIn,
  enrolledCourses,
  enrollCourse,
  userRatings,
  updateRating,
}) => {
  const id = parseInt(courseId);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const autoEnrollTracker = useRef(new Set());

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      try {
        const data = await getCourseById(id);
        setCourse(data);
        setLessons(data.lessons || []);
      } catch (error) {
        console.error('Error loading course:', error);
        setLessons([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourse();
  }, [id]);

  const isAlreadyEnrolled = enrolledCourses && enrolledCourses.includes(id);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (autoEnrollTracker.current.has(id)) return;
    if (isAlreadyEnrolled) {
      autoEnrollTracker.current.add(id);
      return;
    }

    autoEnrollTracker.current.add(id);
    enrollCourse(id);
    console.log(`[AUTO-ENROLL] Tự động đăng ký khóa học ${id}`);
  }, [id, isLoggedIn, isAlreadyEnrolled, enrollCourse]);

  const currentRatingObject = userRatings.find(
    (r) => r.itemId === id && r.itemType === "course"
  );
  const currentRating = currentRatingObject ? currentRatingObject.rating : 0;

  const handleGenerateSummary = useCallback(async () => {
    if (!course) return;
    setIsSummarizing(true);
    setAiSummary(null);
    setShowSummaryModal(true);
    try {
      const summary = await fetchAISummary(course.title, course.details);
      setAiSummary(summary);
    } catch (error) {
      setAiSummary("Lỗi: Không thể kết nối đến Trợ lý AI.");
    } finally {
      setIsSummarizing(false);
    }
  }, [course]);

  const handleSendRating = useCallback(
    async (type, itemId, rating) => {
      if (!isLoggedIn) {
        setMessage("Vui lòng đăng nhập để đánh giá.");
        setMessageType("warning");
        setTimeout(() => navigate("login"), 1000);
        return;
      }

      const response = await postRating(type, itemId, rating);

      if (response.success || response.status === "success") {
        updateRating(itemId, type, rating);
        setMessage("Cảm ơn bạn đã đánh giá khóa học này!");
        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      }
    },
    [isLoggedIn, navigate, updateRating]
  );

  if (!course) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">404</h1>
          <p className="text-xl text-gray-600">Không tìm thấy Khóa học này.</p>
          <button
            onClick={() => navigate("courses")}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Quay lại danh sách Khóa học
          </button>
        </div>
      </main>
    );
  }

  const levelColor = getLevelColor(course.level);

  const SummaryModal = () => (
    <div
      className={`fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[100] transition-opacity duration-300 ${
        showSummaryModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-2xl font-bold text-indigo-600 flex items-center">
            <ZapIcon className="w-6 h-6 mr-2" /> Tóm tắt AI cho Khóa học
          </h3>
          <button
            onClick={() => setShowSummaryModal(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {isSummarizing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Trợ lý AI đang tạo tóm tắt, vui lòng chờ...
            </p>
          </div>
        ) : (
          <div className="text-gray-800 leading-relaxed min-h-[100px]">
            {aiSummary ? (
              <p>{aiSummary}</p>
            ) : (
              <p className="text-center text-gray-500">
                Nhấn nút "Tạo Tóm tắt AI" để bắt đầu.
              </p>
            )}
          </div>
        )}
        <div className="mt-6 text-right">
          <button
            onClick={() => setShowSummaryModal(false)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <main className="min-h-screen pt-24 bg-gray-50">
        <MessageBox
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
        <SummaryModal />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 mb-10 border-t-4 border-indigo-600">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3 flex-shrink-0">
                <img
                  src={getCourseThumbnail(course)}
                  alt={course.title}
                  className="w-full h-auto rounded-xl shadow-xl object-cover aspect-video"
                  onError={imageErrorFallback}
                  loading="lazy"
                />
              </div>

              <div className="lg:w-2/3">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-indigo-600 font-semibold text-sm bg-indigo-100 px-3 py-1 rounded-full">
                    {course.subject}
                  </span>
                  <span
                    className={`px-4 py-1 text-sm font-bold text-white rounded-full shadow-md ${levelColor}`}
                  >
                    Level {course.level}
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  {course.title}
                </h1>

                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mr-4">
                    Đánh giá:
                  </h3>
                  <RatingStars
                    itemId={id}
                    itemType="course"
                    currentRating={currentRating}
                    onRate={handleSendRating}
                  />
                </div>

                <p className="text-gray-600 text-lg mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center space-x-6 text-gray-700 mb-6">
                  <div className="flex items-center mb-2">
                    <UsersIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>
                      Giảng viên:{" "}
                      <span className="font-semibold">{course.instructor}</span>
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <ListIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>{course.lesson_count} Bài học</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing}
                    className="flex-1 sm:flex-none px-6 py-3 text-lg font-bold text-indigo-600 bg-indigo-100 border border-indigo-600 rounded-xl hover:bg-indigo-200 transition duration-300 shadow-lg shadow-indigo-100 transform hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center"
                  >
                    <ZapIcon
                      className={`w-5 h-5 mr-2 ${
                        isSummarizing ? "animate-pulse" : ""
                      }`}
                    />
                    {isSummarizing ? "Đang tạo..." : "Tạo Tóm tắt AI"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Thông tin chi tiết
              </h2>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-700 leading-relaxed">
                  {course.details}
                </p>
                <p className="mt-4 text-sm text-gray-500 italic">
                  Mã khóa học: {courseId}
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nội dung Khóa học
              </h2>
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {lessons.map((lesson, index) => (
                    <li
                      key={lesson.id}
                      className={`p-4 flex justify-between items-center transition duration-150 ${
                        isAlreadyEnrolled
                          ? "hover:bg-indigo-50 cursor-pointer"
                          : "opacity-50 cursor-default"
                      }`}
                      onClick={
                        isAlreadyEnrolled
                          ? () => navigate("lesson-viewer", lesson.id)
                          : null
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-indigo-600 font-semibold">
                          {index + 1}.
                        </span>
                        <span className="text-gray-800 font-medium">
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{lesson.duration}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {lessons.length === 0 && (
                  <p className="p-4 text-center text-gray-500">
                    Chưa có bài học nào được thêm.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CourseDetailPage;
