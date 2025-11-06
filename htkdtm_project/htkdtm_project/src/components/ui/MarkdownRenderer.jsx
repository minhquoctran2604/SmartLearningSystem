// src/components/ui/MarkdownRenderer.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const MarkdownRenderer = ({ content }) => {
  // Handle undefined/null content
  if (!content) {
    return (
      <div className="text-gray-500 italic">
        Nội dung đang được cập nhật...
      </div>
    );
  }

  return (
    <div className="markdown-content prose prose-slate max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-3" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-gray-800 mt-5 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-700 leading-relaxed mb-3" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6 mb-3 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-6 mb-3 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-800" {...props} />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="bg-indigo-50 px-2 py-0.5 rounded text-sm font-mono text-indigo-700 border border-indigo-200" {...props} />
            ) : (
              <code className="text-gray-100" {...props} />
            ),
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto shadow-lg border border-gray-700 font-mono text-sm" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
