// src/services/utils.js

export const getLevelColor = (level) => {
  switch (level) {
    case 1:
      return "bg-green-500/90";
    case 2:
      return "bg-sky-500/90";
    case 3:
      return "bg-yellow-500/90";
    case 4:
      return "bg-orange-500/90";
    case 5:
      return "bg-red-500/90";
    default:
      return "bg-gray-500";
  }
};
