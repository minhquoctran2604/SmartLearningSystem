// src/pages/tai-nguyen_index.jsx
import React, { useState, useEffect } from "react";
import Footer from "../components/layout/Footer.jsx";
import { fetchResources } from "../services/resourceService.js";
import { BookOpenIcon, ClockIcon } from "../services/icons.jsx";

const ResourceCard = ({ resource, navigate }) => {
  return (
    <div
      className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-xl transition duration-300 cursor-pointer"
      onClick={() => navigate("resource-detail", resource.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-900 hover:text-yellow-700 transition duration-150">
          {resource.title}
        </h3>
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {resource.description}
      </p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <BookOpenIcon className="w-4 h-4 mr-1 text-indigo-500" />
          <span>
            {resource.subject ? `Chủ đề: ${resource.subject}` : "Nội dung video"}
          </span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>Video</span>
        </div>
      </div>
    </div>
  );
};

const ResourceBrowsePage = ({ navigate }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources()
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi tải tài nguyên:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-indigo-600 font-semibold">
        Đang tải tài nguyên...
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen pt-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-4 border-yellow-200 inline-block pb-1">
            Các chủ đề khác 📚
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                navigate={navigate}
              />
            ))}
          </div>

          {resources.length === 0 && (
            <p className="text-center py-10 text-gray-500">
              Không có tài nguyên nào được tìm thấy.
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default ResourceBrowsePage;
