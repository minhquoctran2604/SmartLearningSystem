// src/pages/dashboard.jsx

import React, { useState, useEffect } from "react";
import Footer from "../components/layout/Footer.jsx";
import { fetchInProgressItems } from "../services/progressService.js";
import { fetchMyRatings } from "../services/interactionsService.js";
import { ZapIcon } from "../services/icons.jsx";

// DashboardPage component
const DashboardPage = ({
  navigate,
  isLoggedIn,
  completedItems,
  enrolledCourses,
  userRatings,
}) => {
  const [overview, setOverview] = useState([]);
  const [ratingsHistory, setRatingsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOGIC BẢO VỆ
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("login");
    }
  }, [isLoggedIn, navigate]);

  // LẤY DỮ LIỆU TỔNG QUAN, THỐNG KÊ VÀ RATING
  useEffect(() => {
    if (!isLoggedIn) return;

    Promise.all([
      fetchInProgressItems(),
      fetchMyRatings(userRatings),
    ])
      .then(([inProgressData, ratingsData]) => {
        console.log('📊 In-Progress Items Data:', inProgressData);
        console.log('⭐ Ratings History Data:', ratingsData);
        setOverview(inProgressData);
        setRatingsHistory(ratingsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi tải Dashboard:", error);
        setLoading(false);
      });
  }, [isLoggedIn, completedItems, enrolledCourses, userRatings, navigate]);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="text-center py-20 text-indigo-600 font-semibold">
        Đang tải Dashboard...
      </div>
    );
  }

  // Hàm hiển thị rating
  const StarRatingDisplay = ({ rating }) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <ZapIcon
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-current" : "text-gray-300"}`}
          strokeWidth={i < rating ? 0 : 2}
        />
      ))}
    </div>
  );

  return (
    <>
      <main className="min-h-screen pt-24 bg-gray-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
            Tổng quan Học tập 🚀
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
                Tiến độ đang thực hiện
              </h2>
              <div className="space-y-4 mb-10">
                {overview.length > 0 ? (
                  overview.map((item) => (
                    <div
                      key={item.type + item.id}
                      className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-indigo-400 flex justify-between items-center transition duration-300 transform hover:scale-[1.01]"
                      onClick={() =>
                        navigate(
                          item.type === "Course"
                            ? "course-detail"
                            : "resource-detail",
                          item.id
                        )
                      }
                    >
                      <div className="w-full">
                        <p className="text-sm font-medium text-gray-500">
                          {item.type === "Course" ? "Khóa học" : "Chủ đề"} | {item.last_accessed}
                        </p>
                        <p className="text-xl font-bold text-gray-900 truncate">
                          {item.title}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${item.progress_percent}%` }}
                          ></div>
                        </div>
                      </div>
                      <span
                        className={`text-3xl font-extrabold ml-4 ${
                          item.progress_percent === 100
                            ? "text-green-600"
                            : "text-indigo-600"
                        }`}
                      >
                        {item.progress_percent}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-5 text-gray-500 bg-white p-5 rounded-xl shadow-lg">
                    Hãy đăng ký khóa học để bắt đầu!
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
                  Lịch sử Đánh giá
                </h2>
                <div className="bg-white p-5 rounded-xl shadow-lg space-y-3 max-h-[70vh] overflow-y-auto">
                  {ratingsHistory.length > 0 ? (
                    ratingsHistory.map((ratingItem, index) => (
                      <div
                        key={index}
                        className="border-b pb-3 last:border-b-0 last:pb-0 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                        onClick={() =>
                          navigate(
                            ratingItem.type === "course"
                              ? "course-detail"
                              : "resource-detail",
                            ratingItem.id
                          )
                        }
                      >
                        <StarRatingDisplay rating={ratingItem.rating} />
                        <p className="text-lg font-semibold text-gray-900 mt-1 truncate">
                          {ratingItem.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Đánh giá vào: {ratingItem.date}
                        </p>
                        <span className="text-xs font-medium text-indigo-500">
                          {ratingItem.type === "course"
                            ? "Khóa học"
                            : "Chủ đề"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-5">
                      Bạn chưa có đánh giá nào.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
