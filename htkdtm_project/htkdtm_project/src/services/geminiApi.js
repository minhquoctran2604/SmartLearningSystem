// src/services/geminiApi.js

const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=`;
// **LƯU Ý QUAN TRỌNG:** API key phải được cấp phát trong môi trường Canvas
const apiKey = "AIzaSyByX9l04TuK78tVYhrCxQd7O2znTg8YhJc";

/**
 * Gọi API Gemini để tạo tóm tắt khóa học
 * @param {string} title Tiêu đề khóa học
 * @param {string} details Chi tiết khóa học
 * @returns {Promise<string>} Tóm tắt khóa học
 */
export const fetchAISummary = async (title, details) => {
  const systemPrompt =
    "Bạn là một trợ lý AI chuyên nghiệp. Nhiệm vụ của bạn là tóm tắt nội dung khóa học dưới đây trong khoảng 3-4 câu ngắn gọn, nhấn mạnh vào giá trị cốt lõi và đối tượng mục tiêu. Phản hồi bằng tiếng Việt.";
  const userQuery = `Tiêu đề khóa học: "${title}". Chi tiết: "${details}"`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  const maxRetries = 3;
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(API_URL + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429 && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          `Gemini API error: ${response.status} - ${errorBody.error.message}`
        );
      }

      const result = await response.json();
      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Lỗi: Không thể tạo tóm tắt từ AI.";
      return text.trim();
    } catch (error) {
      console.error("Lỗi khi gọi Gemini API:", error);
      if (i === maxRetries - 1) {
        return "Xin lỗi, đã xảy ra lỗi trong quá trình tạo tóm tắt AI.";
      }
    }
  }
};
