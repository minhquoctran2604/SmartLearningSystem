// src/components/courses/QuizViewer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { fetchQuiz, submitQuiz } from "../../services/quizService.js";
import { CheckCircleIcon, ZapIcon } from "../../services/icons.jsx";

const QuizViewer = ({ lessonId, updateCompletion }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null); // { score, total, message, isPassed }
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lấy Quiz data (GET /api/quizzes/lesson/{lesson_id})
  useEffect(() => {
    setUserAnswers({});
    setResult(null);
    setIsSubmitted(false);
    setLoading(true);
    fetchQuiz(lessonId)
      .then((data) => {
        setQuiz(data);
      })
      .catch((error) => console.error("Lỗi lấy quiz:", error))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const answersPayload = Object.entries(userAnswers).reduce(
          (acc, [questionId, answer]) => {
            acc[questionId] = answer;
            return acc;
          },
          {}
        );

        if (!quiz) {
          throw new Error("Quiz không tồn tại");
        }

        const attempt = await submitQuiz(quiz.id, lessonId, answersPayload);

        const derivedResult = {
          score: attempt.score,
          total: attempt.total_questions,
          correct: attempt.correct_answers,
          isPassed: attempt.passed,
          message: attempt.passed
            ? "Bạn đã vượt qua bài kiểm tra"
            : "Bạn chưa đạt điểm qua bài kiểm tra",
        };

        setResult(derivedResult);
        setIsSubmitted(true);

        // ✅ Nếu pass quiz, cập nhật completion
        if (derivedResult.isPassed && updateCompletion) {
          updateCompletion("lessons", lessonId);
          console.log(`[QUIZ] Bài học ${lessonId} đã hoàn thành quiz!`);
        }
      } catch (error) {
        console.error("Nộp bài kiểm tra thất bại", error);
      } finally {
        setLoading(false);
      }
    },
    [lessonId, userAnswers, updateCompletion, quiz]
  );

  if (loading) {
    return (
      <div className="text-center py-6 text-indigo-600">
        Đang tải bài kiểm tra...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-6 text-gray-500">
        Bài học này không có bài kiểm tra.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-yellow-500 mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <ZapIcon className="w-6 h-6 mr-2 text-yellow-500" /> {quiz.title}
      </h3>

      {isSubmitted && result ? (
        <div className={`p-6 rounded-lg mb-4 ${result.isPassed ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
          <div className="flex items-center mb-2">
            <CheckCircleIcon className={`w-6 h-6 mr-2 ${result.isPassed ? 'text-green-600' : 'text-red-600'}`} />
            <h4 className={`text-lg font-bold ${result.isPassed ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </h4>
          </div>
          <p className={`text-sm ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
            Điểm: {result.score}/{result.total}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {quiz.questions && quiz.questions.map((question) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">{question.text}</p>
              <div className="space-y-2">
                {question.options && question.options.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={userAnswers[question.id] === option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Đang nộp..." : "Nộp bài"}
          </button>
        </form>
      )}
    </div>
  );
};

export default QuizViewer;
