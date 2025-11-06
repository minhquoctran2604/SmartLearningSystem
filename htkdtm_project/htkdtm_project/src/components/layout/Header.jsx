import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ currentPage, navigate, isLoggedIn, onLogout }) => {
  const handleLogout = () => {
    onLogout();
  };

  const navItems = [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'courses', label: 'Khóa học', path: '/courses' },
    { key: 'resources', label: 'Tài nguyên', path: '/resources' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-gradient hover:scale-105 transition-transform duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SL</span>
            </div>
            <span>SmartLearn</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`font-medium transition-colors duration-200 hover:text-blue-600 ${
                  currentPage === item.key
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden mt-4 flex items-center justify-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`font-medium transition-colors duration-200 ${
                currentPage === item.key
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;