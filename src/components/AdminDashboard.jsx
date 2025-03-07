import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash, Save } from 'lucide-react';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: [],
    testCases: [{ input: '', output: '', isHidden: false }],
    solutionCode: '',
    maxRuntime: 2000,
    maxMemory: 256,
    starterCode: '// Write your solution here\n'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchQuestions();
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/questions/admin', { withCredentials: true });
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAddTestCase = () => {
    setNewQuestion(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '', isHidden: false }]
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setNewQuestion(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setNewQuestion(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/questions', newQuestion, { withCredentials: true });
      setIsAddingQuestion(false);
      setNewQuestion({
        title: '',
        description: '',
        difficulty: 'easy',
        tags: [],
        testCases: [{ input: '', output: '', isHidden: false }],
        solutionCode: '',
        maxRuntime: 2000,
        maxMemory: 256,
        starterCode: '// Write your solution here\n'
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setIsAddingQuestion(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {isAddingQuestion && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description (HTML)</label>
              <textarea
                value={newQuestion.description}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-32 px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newQuestion.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Starter Code</label>
              <textarea
                value={newQuestion.starterCode}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, starterCode: e.target.value }))}
                className="w-full h-32 px-4 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Solution Code</label>
              <textarea
                value={newQuestion.solutionCode}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, solutionCode: e.target.value }))}
                className="w-full h-32 px-4 py-2 border rounded-lg font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Runtime (ms)</label>
                <input
                  type="number"
                  value={newQuestion.maxRuntime}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, maxRuntime: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Memory (MB)</label>
                <input
                  type="number"
                  value={newQuestion.maxMemory}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, maxMemory: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Test Cases</label>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Add Test Case
                </button>
              </div>
              {newQuestion.testCases.map((testCase, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Input</label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      className="w-full h-24 px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Output</label>
                    <textarea
                      value={testCase.output}
                      onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                      className="w-full h-24 px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                      />
                      <span className="text-sm">Hidden test case</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsAddingQuestion(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={16} /> Save Question
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Difficulty</th>
              <th className="px-6 py-3 text-left">Tags</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{question.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {question.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;