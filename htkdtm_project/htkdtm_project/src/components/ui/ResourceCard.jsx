// src/components/ui/ResourceCard.jsx

import React from "react";
import { BookOpenIcon, ClockIcon } from "../../services/icons.jsx";

const ResourceCard = ({ resource, navigate }) => {
  // Logic xác định màu sắc và border dựa trên Type (Đã nâng cấp)
  const typeStyles =
    resource.type === "E-book"
      ? { badge: "bg-indigo-600 text-white", border: "border-indigo-600" }
      : resource.type === "Guide"
      ? { badge: "bg-green-600 text-white", border: "border-green-600" }
      : { badge: "bg-yellow-600 text-gray-900", border: "border-yellow-600" };

  return (
    <div
      // ✅ CẬP NHẬT: Border-top động, Shadow cố định, Premium Animation
      className={`bg-white p-6 rounded-2xl shadow-xl transition duration-300 cursor-pointer 
                        transform hover:scale-[1.02] hover:shadow-2xl 
                        border-t-4 ${typeStyles.border}`}
      onClick={() => navigate("resource-detail", resource.id)}
    >
      {/* 1. HEADER & TYPE BADGE */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-extrabold text-gray-900 line-clamp-2">
          {resource.title}
        </h3>
        {/* ✅ Badge Type: Màu tương phản mạnh */}
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${typeStyles.badge}`}
        >
          {resource.type}
        </span>
      </div>

      {/* 2. DESCRIPTION */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
        {resource.description}
      </p>

      {/* 3. FOOTER & METADATA */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        {/* Subject/Chủ đề (LEFT) */}
        <div className="flex items-center text-sm text-gray-700">
          {/* Icon với màu sắc đặc trưng */}
          <BookOpenIcon className="w-4 h-4 mr-1.5 text-indigo-500" />
          <span className="font-semibold">{resource.subject}</span>
        </div>

        {/* Reading Time (RIGHT) */}
        <div className="flex items-center text-sm text-gray-700">
          <ClockIcon className="w-4 h-4 mr-1.5 text-red-500" />
          <span className="font-semibold">{resource.reading_time}</span>
        </div>
      </div>

      {/* 4. CALL TO ACTION */}
      <div className="mt-4 text-right">
        <button
          className="text-indigo-600 text-base font-bold hover:text-indigo-800 transition duration-150 
                                group-hover:underline flex items-center justify-end w-full"
        >
          Xem Chi tiết
          <span className="ml-1 transition transform group-hover:translate-x-1 duration-150">
            →
          </span>
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
