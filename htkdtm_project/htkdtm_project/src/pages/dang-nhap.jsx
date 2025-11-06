// src/pages/dang-nhap.jsx
import React, { useState } from "react";
import Footer from "../components/layout/Footer.jsx";
import MessageBox from "../components/ui/MessageBox.jsx";
import { UserIcon, MailIcon, LockIcon } from "../services/icons.jsx";
import { login, register } from "../services/authService.js";

const AuthScreen = ({ navigate, handleLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Đăng nhập
        if (!email || !password) {
          setMessage("Vui lòng nhập Email và Mật khẩu.");
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        const userData = await login(email, password);
        handleLoginSuccess(userData);
        setMessage("Đăng nhập thành công! Đang chuyển hướng...");
        setMessageType("success");
        setTimeout(() => navigate("home"), 1500);
      } else {
        // Đăng ký
        if (!name || !email || !password) {
          setMessage("Vui lòng điền đầy đủ thông tin.");
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        await register(email, password, name);
        setMessage("Đăng ký thành công! Vui lòng Đăng nhập.");
        setMessageType("success");
        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const formTitle = isLogin ? "Đăng nhập vào SmartLearn" : "Tạo tài khoản mới";
  const formButtonText = isLogin ? "Đăng nhập" : "Đăng ký";
  const toggleLinkText = isLogin
    ? "Bạn chưa có tài khoản? Đăng ký"
    : "Đã có tài khoản? Đăng nhập";

  return (
    <>
      <main className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 p-4">
        <MessageBox
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-2xl transition-all duration-500 transform hover:shadow-indigo-300">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 border-b pb-2">
            {formTitle}
          </h2>
          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="relative animate-fade-in">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                />
              </div>
            )}
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang xử lý..." : formButtonText}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition duration-150"
            >
              {toggleLinkText}
            </button>
          </p>
        </div>
      </main>
    </>
  );
};

export default AuthScreen;
