import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "./utiles/ApiConfig";

function SecurityQuestion() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/security-questions`)
      .then((response) => {
        setQuestions(response.data.questions);
      })
      .catch((error) => {
        setError(error.response?.data?.message || "Error fetching questions");
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    if (!newQuestion.trim()) return;
  
    axios.post(
      `${API_URL}/api/auth/create-question`,
      { question: newQuestion },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        setQuestions([...questions, { question: newQuestion }]);
        setNewQuestion("");
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Error creating question");
      });
  };
  

  return (
    <div className="w-full mx-auto mt-5 p-5 ">
      <h2 className="text-xl font-semibold mb-4">Manage Security Questions</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a new security question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add</button>
      </form>
      <h3 className="text-lg font-medium mb-2">Existing Questions</h3>
      <ul className="space-y-2">
        {questions.length > 0 ? (
          questions.map((q, index) => (
            <li key={index} className="p-2 border-b">{q.question}</li>
          ))
        ) : (
          <p className="text-gray-500">No security questions available.</p>
        )}
      </ul>
    </div>
  );
}

export default SecurityQuestion;
