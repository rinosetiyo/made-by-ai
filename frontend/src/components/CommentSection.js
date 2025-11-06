import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

function CommentSection({ articleId }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`articles/${articleId}/comments/`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiClient.post(`articles/${articleId}/comments/`, {
        ...newComment,
        article: articleId
      });
      
      // Reset form
      setNewComment({
        author_name: '',
        author_email: '',
        content: ''
      });
      
      // Refresh comments
      fetchComments();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to submit comments.');
        navigate('/login');
      } else {
        setError('Failed to submit comment. Please try again.');
      }
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Comments ({comments.length})</h2>
      
      {/* Form komentar */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">Add a Comment</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Name *
              </label>
              <input
                type="text"
                id="author_name"
                name="author_name"
                value={newComment.author_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="author_email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                id="author_email"
                name="author_email"
                value={newComment.author_email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Your email"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Comment *
            </label>
            <textarea
              id="content"
              name="content"
              value={newComment.content}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="Write your comment here..."
            ></textarea>
          </div>
          <div className="flex items-center">
            {error && (
              <p className="text-red-600 mr-4 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={`bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors duration-300 ${submitting ? 'opacity-50 cursor-not-allowed' : ''} dark:hover:bg-red-800`}
            >
              {submitting ? 'Submitting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar komentar */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border-b border-gray-200 pb-6 dark:border-gray-700">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white">{comment.author_name}</h4>
                    <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default CommentSection;