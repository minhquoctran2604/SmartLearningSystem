// src/pages/resources/[id].jsx

import React, { useState, useEffect, useCallback } from "react";
import Footer from "../../components/layout/Footer.jsx";
import MessageBox from "../../components/ui/MessageBox.jsx";
import MarkdownRenderer from "../../components/ui/MarkdownRenderer.jsx";
import RatingStars from "../../components/ui/RatingStars.jsx";
import {
  getResourceById,
  getResourceProgress,
  markResourceCompleted,
  updateResourceProgress,
} from "../../services/resourceService.js";
import { postRating } from "../../services/interactionsService.js";
import { ClockIcon, CheckCircleIcon } from "../../services/icons.jsx";
import YouTubePlayer from "../../components/YouTubePlayer.jsx";

const ResourceDetailPage = ({
  resourceId,
  navigate,
  isLoggedIn,
  updateCompletion,
  userRatings,
  updateRating,
}) => {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [progress, setProgress] = useState(0);

  const id = parseInt(resourceId);
  const currentRatingObject = userRatings?.find(
    (r) => r.itemId === id && r.itemType === "resource"
  );
  const currentRating = currentRatingObject ? currentRatingObject.rating : 0;

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
        setMessage("Cảm ơn bạn đã đánh giá!");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);
      }
    },
    [isLoggedIn, navigate, updateRating]
  );

  useEffect(() => {
    if (!isLoggedIn) {
      setMessage("Vui lòng đăng nhập để xem tài nguyên này.");
      const timer = setTimeout(() => navigate("login"), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);
    
    Promise.all([
      getResourceById(id),
      getResourceProgress(id)
    ])
      .then(([resourceData, progressData]) => {
        setResource(resourceData);
        if (progressData && progressData.watch_percent) {
          setProgress(progressData.watch_percent);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi tải chi tiết tài nguyên:", error);
        setLoading(false);
      });
  }, [id, isLoggedIn]);

  const handleMarkComplete = async () => {
    setIsCompleted(true);
    updateCompletion("resources", parseInt(resourceId, 10));
    await markResourceCompleted(resourceId);
    setMessage("Bạn đã hoàn thành tài liệu này!");
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen pt-16 flex items-center justify-center bg-red-50">
        <MessageBox
          message={message}
          type="error"
          onClose={() => setMessage(null)}
        />
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Truy cập bị từ chối
          </h1>
          <p className="text-gray-600">
            Bạn sẽ được chuyển hướng đến trang Đăng nhập.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-indigo-600 font-semibold">
        Đang tải chi tiết tài nguyên...
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20 text-red-500">
        Tài nguyên không tồn tại.
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen pt-24 bg-gray-100">
        <MessageBox
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {resource.title}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600 mb-6">
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
              {resource.resource_type === "video"
                ? "Video"
                : resource.resource_type ?? "Resource"}
            </span>
          </div>

          <div className="flex items-center mb-6 bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mr-4">
              Đánh giá:
            </h3>
            <RatingStars
              itemId={id}
              itemType="resource"
              currentRating={currentRating}
              onRate={handleSendRating}
            />
          </div>

          <div className="flex justify-between items-start lg:space-x-8">
            <div className="lg:w-3/4 bg-white p-8 rounded-2xl shadow-xl">
              {resource.resource_type === "video" ? (
                <YouTubePlayer
                  videoUrl={resource.url}
                  trackingId={resourceId}
                  context="resource"
                  initialProgress={progress}
                  onProgressUpdate={(progressData) => {
                    setProgress(progressData.video_watched_percent || 0);
                    updateResourceProgress(resourceId, {
                      watch_percent: progressData.video_watched_percent,
                      time_spent: progressData.time_spent,
                      completed: progressData.video_completed,
                    });
                  }}
                  onComplete={() => {
                    setProgress(100);
                    updateCompletion("resources", parseInt(resourceId, 10));
                    setIsCompleted(true);
                    markResourceCompleted(resourceId);
                  }}
                />
              ) : (
                <MarkdownRenderer content={resource.content} />
              )}
            </div>

            <aside className="lg:w-1/4 sticky top-20 flex-shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-2xl border-t-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Tiến độ
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Video đã xem:{" "}
                  <span className="font-semibold text-indigo-600">
                    {progress.toFixed(0)}%
                  </span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

export default ResourceDetailPage;
