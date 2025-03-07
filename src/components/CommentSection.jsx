import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Reply, AtSign } from 'lucide-react';

function CommentSection({ questionId, comments, onAddComment, onAddReply }) {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  const handleMention = (username) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const newValue = newComment.substring(0, lastAtIndex) + `@${username} `;
    setNewComment(newValue);
    setShowMentions(false);
    setMentionQuery('');
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const query = value.substring(lastAtIndex + 1).trim();
      setMentionQuery(query);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleSubmit = async () => {
    if (replyingTo) {
      await onAddReply(replyingTo._id, newComment);
    } else {
      await onAddComment(newComment);
    }
    setNewComment('');
    setReplyingTo(null);
  };

  const renderComment = (comment, level = 0) => {
    if (level >= 3) return null; // Limit nesting to 3 levels

    return (
      <div key={comment._id} className={`pl-${level * 4} mb-4`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">{comment.user.username}</span>
            <span className="text-gray-500 text-sm">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mb-2">{comment.content}</p>
          <button
            onClick={() => setReplyingTo(comment)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
          >
            <Reply size={14} /> Reply
          </button>
        </div>

        {comment.replies && comment.replies.map(reply => renderComment(reply, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {comments.map(comment => renderComment(comment))}

      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={handleCommentChange}
            placeholder={replyingTo ? `Reply to ${replyingTo.user.username}...` : "Add a comment..."}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {replyingTo ? 'Reply' : 'Comment'}
          </button>
        </div>

        {showMentions && (
          <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg">
            <div className="p-2 text-sm text-gray-500">
              <AtSign size={14} className="inline mr-1" />
              Mention a user
            </div>
            {/* This would be populated with actual users from your system */}
            <div className="max-h-40 overflow-y-auto">
              {['user1', 'user2', 'user3'].map(username => (
                <button
                  key={username}
                  onClick={() => handleMention(username)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {username}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentSection;