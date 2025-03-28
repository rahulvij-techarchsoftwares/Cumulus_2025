import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './utiles/ApiConfig';
import { Camera, Check, Eye, Pencil, Trash2, X } from 'lucide-react';
import { Link as ScrollLink, Element } from "react-scroll"



const AdminFAQ = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedTopic, setEditedTopic] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedAnswer, setEditedAnswer] = useState("");


  const handleEditQuestion = (question_id, q) => {
    setEditingIndex(question_id); // Store question_id instead of index
    setEditedQuestion(q.question);
    setEditedAnswer(q.answer);
  };


  const handleSaveQuestion = (question_id) => {
    updateQuestion(selectedTopic._id, question_id, editedQuestion, editedAnswer);
    setEditingIndex(null);
  };


  const handleCancelQuestion = () => {
    setEditingIndex(null);
  };

  const handleEdit = (topic) => {
    setEditingId(topic._id);
    setEditedTopic(topic.topic);
  };

  const handleSave = (id) => {
    updateTopic(id, editedTopic); // Call update function with new topic name
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  useEffect(() => {
    fetchTopics();
  }, []);


  const updateTopic = async (topic_id, editTopic) => {
    const token = localStorage.getItem("token"); 
    if (!editTopic) return alert('New topic name is required');
  
    try {
      await axios.put(
        `${API_URL}/api/faq/topics/update`,
        { topic_id, new_topic: editTopic },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
  
      fetchTopics();
      // setEditTopic('');
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };
  

  const deleteTopic = async (topic_id) => {
    try {
      await axios.delete('http://localhost:3000/api/faq/topics/delete', { data: { topic_id } });
      fetchTopics();
      setSelectedTopic(null);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const updateQuestion = async (topic_id, question_id, editQuestion, editAnswer) => {
    const token = localStorage.getItem("token");
  
    console.log(topic_id, question_id, editQuestion, editAnswer);
  
    if (!topic_id || !question_id || !editQuestion || !editAnswer) {
      return alert('All fields are required');
    }
  
    try {
      await axios.put(
        'http://localhost:3000/api/faq/topics/update-question',
        {
          topic_id,
          question_id,
          new_question: editQuestion,
          new_answer: editAnswer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
  
      fetchQuestions(topic_id);
      setEditingIndex(null); // Reset editing state
      setEditedQuestion('');
      setEditedAnswer('');
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };
  


  const deleteQuestion = async (topic_id, question_id) => {
    try {
      await axios.delete(`${API_URL}/api/faq/topics/delete-question`, {
        data: { topic_id, question_id },
      });
      fetchQuestions(topic_id); // Fetch updated questions list
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };




  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/faq/topics`);
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchQuestions = async (topic_id) => {
    try {
      const response = await axios.post(`${API_URL}/api/faq/topics/questions`, { topic_id });
      setSelectedTopic(response.data.topic);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const addTopic = async () => {
    if (!newTopic) return alert('Topic name is required');
    try {
      const response = await axios.post(`${API_URL}/api/faq/add-topics`, { topic: newTopic });
      setTopics([...topics, response.data.topic]);
      setNewTopic('');
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const addQuestion = async () => {
    const token = localStorage.getItem("token"); 
    if (!selectedTopic || !question || !answer) return alert('All fields are required');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/faq/topics/add-questions`,
        {
          topic_id: selectedTopic._id,
          question,
          answer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
  
      setSelectedTopic(response.data.topic);
      setQuestion('');
      setAnswer('');
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };
  

  return (
    <div className=" mx-auto p-6  w-full">
      <h2 className="text-2xl font-bold text-center mb-4">FAQ Admin Panel</h2>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Add New Topic</h3>
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter topic name"
          className="w-full p-2 border rounded-md"
        />
        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={addTopic}>Add Topic</button>
      </div>

      <div className="mb-6 bg-white rounded-lg max-h-[55vh] overflow-y-scroll shadow">
        <h3 className="text-lg font-semibold border-b-2 sticky top-0 bg-white p-2">Existing Topics</h3>
        <ul className="space-y-2 p-4">
          {topics.map((topic) => (
            <li key={topic._id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
              {editingId === topic._id ? (
                <input
                  type="text"
                  value={editedTopic}
                  onChange={(e) => setEditedTopic(e.target.value)}
                  className="border p-1 rounded-md"
                />
              ) : (
                topic.topic
              )}

              <div className="flex space-x-4 md:space-x-2">
                {editingId === topic._id ? (
                  <>
                    <button className="bg-blue-500 text-white px-3 md:inline hidden py-1 rounded-md hover:bg-blue-600" onClick={() => handleSave(topic._id)}>Save</button>
                    <button
                      onClick={() => handleSave(topic._id)}
                      className='inline md:hidden'>

                      <Check className='text-green-500' /></button>
                    <button className="bg-gray-500 text-white px-3 md:inline hidden py-1 rounded-md hover:bg-gray-600" onClick={handleCancel}>Cancel</button>
                    <button
                      onClick={handleCancel}
                      className='inline md:hidden'>
                      <X className='text-red-500' /></button>
                  </>
                ) : (
                  <>
                    <ScrollLink
                      to="viewQuestion"
                      smooth={true}
                      duration={500}
                      offset={-50}
                      className="cursor-pointer "
                    >
                      <button className="bg-white text-black md:px-3 py-1 rounded-md md:inline hidden" onClick={() => fetchQuestions(topic._id)}>View Questions</button>
                    </ScrollLink>

                    <ScrollLink
                      to="viewQuestion"
                      smooth={true}
                      duration={500}
                      offset={-50}
                      className="cursor-pointer inline md:hidden"
                    >
                      <button onClick={() => fetchQuestions(topic._id)}>
                        <Eye className="text-gray-500" />
                      </button>
                    </ScrollLink>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-md md:inline hidden hover:bg-green-600" onClick={() => handleEdit(topic)}>Edit</button>
                    <button onClick={() => handleEdit(topic)} className='inline md:hidden'><Pencil className='text-blue-500' /></button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-md md:inline hidden hover:bg-red-600" onClick={() => deleteTopic(topic._id)}>Delete</button>
                    <button onClick={() => deleteTopic(topic._id)} className='inline md:hidden'><Trash2 className='text-red-500' /></button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {selectedTopic ? (
          <Element name="viewQuestion">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Questions for {selectedTopic.topic}</h3>
              <ul className="space-y-2 mb-4">
                {selectedTopic.questions.map((q) => (
                  <li key={q._id} className="p-2 bg-gray-100 font-semibold rounded-md">
                    {editingIndex === q._id ? (
                      <>
                        <input
                          type="text"
                          value={editedQuestion}
                          onChange={(e) => setEditedQuestion(e.target.value)}
                          className="border p-1 rounded-md w-full mb-1"
                          placeholder="Edit question"
                        />
                        <input
                          type="text"
                          value={editedAnswer}
                          onChange={(e) => setEditedAnswer(e.target.value)}
                          className="border p-1 rounded-md w-full"
                          placeholder="Edit answer"
                        />
                      </>
                    ) : (
                      <>
                        <div>{q.question}</div>
                        <div className="text-gray-600">{q.answer}</div>
                      </>
                    )}

                    <div className="flex justify-end space-x-2 mt-2">
                      {editingIndex === q._id ? (
                        <>
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                            onClick={() => handleSaveQuestion(q._id)} // Pass question_id instead of index
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                            onClick={handleCancelQuestion}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                            onClick={() => handleEditQuestion(q._id, q)} // Pass question_id
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                            onClick={() => deleteQuestion(selectedTopic._id, q._id)} // Use actual question ID
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <h4 className="text-md font-semibold mb-2">Add New Question</h4>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter question"
                className="w-full p-2 border rounded-md mb-2"
              />
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter answer"
                className="w-full p-2 border rounded-md mb-2"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={addQuestion}>Add Question</button>
            </div>
          </Element>

        ) : (
          <>
            <Element name="viewQuestion">
              <div className="">

              </div>
            </Element>
          </>
        )}
      </div>

    </div>
  );
};

export default AdminFAQ;
