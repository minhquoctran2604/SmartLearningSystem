// src/components/ui/CourseCard.jsx
import React from "react";
import { ListIcon } from "../../services/icons.jsx";
import { getLevelColor } from "../../services/utils.js";
import { getCourseThumbnail, imageErrorFallback } from "../../utils/getCourseThumbnail.js";

const CourseCard = ({ course, navigate }) => {
  const levelColor = getLevelColor(course.level);

  // Resolve thumbnail deterministically (keyword/category-based + fallback)
  const thumbnailUrl = getCourseThumbnail(course);

  return (
    <div
      className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-100 group"
      onClick={() => navigate("course-detail", course.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
          src={thumbnailUrl}
          alt={course.title}
          onError={imageErrorFallback}
          loading="lazy"
        />
        <div
          className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md ${levelColor} animate-pulse-slow`}
        >
          Cấp độ {course.level}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition duration-150">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {course.description}
        </p>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <ListIcon className="w-4 h-4 text-indigo-500" />
            <span>{course.lesson_count} Bài học</span>
          </div>
          <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-semibold">
            {course.subject}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
