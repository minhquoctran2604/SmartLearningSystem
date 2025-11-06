// src/components/layout/Footer.jsx
import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-700 pb-8">
      {/* Cột 1: Giới thiệu */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">SmartLearn</h2>
        <p className="text-sm leading-relaxed">
          Nền tảng học tập thông minh giúp bạn tiếp cận tri thức một cách dễ
          dàng và hiệu quả.
        </p>
      </div>

      {/* Cột 2: Liên kết nhanh */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Liên kết nhanh
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="/" className="hover:text-white transition">
              Trang chủ
            </a>
          </li>
          <li>
            <a href="/courses" className="hover:text-white transition">
              Khóa học
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-white transition">
              Về chúng tôi
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-white transition">
              Liên hệ
            </a>
          </li>
        </ul>
      </div>

      {/* Cột 3: Mạng xã hội */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Theo dõi chúng tôi
        </h3>
        <div className="flex space-x-4 mt-2">
          <a href="#" className="hover:text-blue-500 text-xl transition">
            <FaFacebook />
          </a>
          <a href="#" className="hover:text-sky-400 text-xl transition">
            <FaTwitter />
          </a>
          <a href="#" className="hover:text-pink-500 text-xl transition">
            <FaInstagram />
          </a>
          <a href="#" className="hover:text-blue-400 text-xl transition">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>

    {/* Dòng bản quyền */}
    <div className="text-center text-sm text-gray-500 mt-6">
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <span className="text-white font-medium">SmartLearn</span>. All rights
        reserved.
      </p>
      <p className="mt-1 italic">"Học tập thông minh – Thành công vượt trội"</p>
    </div>
  </footer>
);

export default Footer;
