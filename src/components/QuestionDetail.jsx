import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Play, Send, MessageSquare } from 'lucide-react';

function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchQuestion();
    fetchComments();
  }, [id, user]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/questions/${id}`);
      setQuestion(response.data);
      setCode(response.data.starterCode || '// Write your code here');
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/comments/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const runCode = async (isSubmission = false) => {
    try {
      setIsRunning(true);
      const endpoint = isSubmission ? 'submit' : 'run';
      const response = await axios.post(`http://localhost:3000/api/submissions/${endpoint}`, {
        questionId: id,
        code,
        input: customInput,
      }, { withCredentials: true });

      if (isSubmission) {
        setResult(response.data);
      } else {
        setCustomOutput(response.data.output);
      }
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await runCode(true);
    setIsSubmitting(false);
  };

  const addComment = async () => {
    try {
      await axios.post(`http://localhost:3000/api/comments`, {
        questionId: id,
        content: newComment,
      }, { withCredentials: true });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
        <div className="flex gap-2 mb-4">
          <span className={`px-2 py-1 rounded text-sm ${
            question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty}
          </span>
          {question.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
        <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: question.description }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow">
            <Editor
              height="60vh"
              defaultLanguage="javascript"
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => runCode()}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Play size={16} /> Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={16} /> Submit
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Custom Input</h3>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full h-32 p-2 border rounded"
              placeholder="Enter your test case input here..."
            />
          </div>

          {customOutput && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Output</h3>
              <pre className="bg-gray-100 p-2 rounded">{customOutput}</pre>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Submission Result</h3>
              <div className={`p-2 rounded ${
                result.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <p className="font-medium">{result.status}</p>
                <p>Runtime: {result.runtime}ms</p>
                <p>Memory: {result.memory}MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={20} />
          <h2 className="text-xl font-semibold">Discussion</h2>
        </div>
        
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{comment.user.username}</span>
                <span className="text-gray-500 text-sm">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={addComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionDetail;