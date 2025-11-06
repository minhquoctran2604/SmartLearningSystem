// src/components/ui/MessageBox.jsx
import React, { useEffect } from "react";

const MessageBox = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const baseStyle =
    "fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-2xl z-[100] transition-all duration-500 transform";
  let typeStyle = "";
  switch (type) {
    case "success":
      typeStyle = "bg-green-500 text-white";
      break;
    case "error":
      typeStyle = "bg-red-500 text-white";
      break;
    case "warning":
      typeStyle = "bg-yellow-500 text-gray-900";
      break;
    default:
      typeStyle = "bg-blue-500 text-white";
      break;
  }

  return (
    <div className={`${baseStyle} ${typeStyle} animate-slide-in-down`}>
      {message}
    </div>
  );
};

export default MessageBox;
