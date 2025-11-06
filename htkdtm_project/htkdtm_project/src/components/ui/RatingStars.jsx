// src/components/ui/RatingStars.jsx

import React, { useState } from "react";
// Star Icon (Giả định ZapIcon là ngôi sao)
import { ZapIcon } from "../../services/icons.jsx";

const RatingStars = ({ itemId, itemType, currentRating = 0, onRate }) => {
  // 🛑 CHỈ GIỮ LẠI state cho HOVER và SUBMITTING
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Tính toán trạng thái dựa trên props (Global State)
  const isRated = currentRating > 0;
  const ratingDisplay = hover || currentRating;

  const handleRatingClick = async (newRating) => {
    // Chỉ cho phép gửi nếu chưa được đánh giá và không đang gửi
    if (isRated || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Gọi hàm xử lý đánh giá (sẽ gọi updateRating trong App.jsx)
      await onRate(itemType, itemId, newRating);
    } catch (error) {
      alert("Lỗi gửi đánh giá.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleRatingClick(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
            // ✅ Dùng isRated từ props
            disabled={isRated || isSubmitting}
            className="transition-all duration-150 transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <ZapIcon
              className={`w-6 h-6 ${
                // ✅ Dùng ratingDisplay
                ratingValue <= ratingDisplay
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              strokeWidth={ratingValue <= ratingDisplay ? 0 : 2}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-500">
        {isSubmitting
          ? "Đang gửi..."
          : isRated
          ? `(${currentRating} sao)` // ✅ Hiển thị currentRating
          : "(Chưa đánh giá)"}
      </span>
    </div>
  );
};

export default RatingStars;
