// src/components/hooks/useDarkMode.jsx

import { useState, useEffect } from "react";

// Key dùng để lưu trạng thái trong localStorage
const DARK_MODE_KEY = "smartlearn-dark-mode";

const useDarkMode = () => {
  // Lấy giá trị ban đầu từ localStorage hoặc mặc định là false
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(DARK_MODE_KEY);
      return savedMode === "true";
    }
    return false;
  });

  // useEffect để áp dụng class 'dark' và lưu vào localStorage
  useEffect(() => {
    const root = window.document.documentElement; // Thẻ <html>

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem(DARK_MODE_KEY, "true");
    } else {
      root.classList.remove("dark");
      localStorage.setItem(DARK_MODE_KEY, "false");
    }
  }, [isDarkMode]);

  // Hàm chuyển đổi chế độ
  const toggleDarkMode = () => setIsDarkMode((prevMode) => !prevMode);

  return [isDarkMode, toggleDarkMode];
};

export default useDarkMode;
