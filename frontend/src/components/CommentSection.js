import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

function CommentSection({ articleId }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    author_name: '', // Akan diisi otomatis jika user login
    author_email: '', // Akan diisi otomatis jika user login
    content: '',
    parent_id: null  // Untuk reply komentar
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // Untuk melacak komentar yang sedang di-reply

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  // Isi otomatis nama dan email jika user sudah login
  useEffect(() => {
    if (isAuthenticated && user) {
      setNewComment(prev => ({
        ...prev,
        author_name: user.username,
        author_email: user.email
      }));
    } else {
      // Jika user logout, reset field
      setNewComment(prev => ({
        ...prev,
        author_name: '',
        author_email: ''
      }));
    }
  }, [isAuthenticated, user]);

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
    
    setSubmitting(true);
    setError('');

    try {
      let commentData = {
        ...newComment,
        article: articleId
      };
      
      // Jika user sudah login, gunakan data dari akun mereka
      if (isAuthenticated && user) {
        commentData = {
          ...commentData,
          author_name: user.username,
          author_email: user.email
        };
      }
      
      // Hapus parent_id dari payload jika nilainya null
      if (!commentData.parent_id) {
        delete commentData.parent_id;
      }
      
      await apiClient.post(`articles/${articleId}/comments/`, commentData);
      
      // Reset form - jika user login, jaga nama dan email tetap terisi
      setNewComment(prev => ({
        author_name: isAuthenticated ? user.username : '',
        author_email: isAuthenticated ? user.email : '',
        content: '',
        parent_id: null
      }));
      
      // Reset reply state
      setReplyingTo(null);
      
      // Refresh comments
      fetchComments();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to submit comments.');
        // Jika sedang dalam mode reply, tawarkan ke login
        if (replyingTo) {
          if (window.confirm('You need to login to submit comments. Go to login page?')) {
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      } else {
        setError('Failed to submit comment. Please try again.');
      }
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (commentId) => {
    if (!isAuthenticated) {
      // Jika user belum login, tampilkan pesan atau arahkan ke login
      if (window.confirm('You need to login to reply to comments. Go to login page?')) {
        navigate('/login');
      }
      return;
    }
    setReplyingTo(commentId);
    setNewComment(prev => ({
      ...prev,
      parent_id: commentId
    }));
    // Scroll ke form komentar
    document.getElementById('comment-form').scrollIntoView({ behavior: 'smooth' });
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment(prev => ({
      ...prev,
      parent_id: null,
      content: ''
    }));
  };

  const handleLike = async (commentId, currentLikes, userHasLiked) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      let response;
      if (userHasLiked) {
        // Jika sudah disukai, maka unlike
        response = await apiClient.delete(`comments/${commentId}/like/`);
      } else {
        // Jika belum disukai, maka like
        response = await apiClient.post(`comments/${commentId}/like/`);
      }
      
      // Update jumlah like dan status di state
      setComments(prevComments => 
        updateCommentLikes(prevComments, commentId, response.data.likes, !userHasLiked)
      );
    } catch (error) {
      console.error('Error handling like/unlike comment:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to like/unlike comment. Please try again.');
      }
    }
  };

  // Fungsi bantu untuk memperbarui jumlah like di state
  const updateCommentLikes = (comments, commentId, newLikes, userHasLiked) => {
    return comments.map(comment => {
      // Periksa komentar utama
      if (comment.id === commentId) {
        return { ...comment, likes: newLikes, user_has_liked: userHasLiked };
      }
      
      // Periksa reply komentar dan juga nested reply
      if (comment.replies && comment.replies.length > 0) {
        // Update rekursif pada reply
        const updatedReplies = comment.replies.map(reply => {
          if (reply.id === commentId) {
            return { ...reply, likes: newLikes, user_has_liked: userHasLiked };
          }
          // Tidak menangani nested-nested reply, hanya level pertama reply
          return reply;
        });
        
        return {
          ...comment,
          replies: updatedReplies
        };
      }
      
      return comment;
    });
  };

  const handleReport = async (commentId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Ambil alasan report dari user dengan pilihan
    const reason = prompt('Why are you reporting this comment?\n\nChoose from:\n- spam\n- harassment\n- inappropriate\n- misleading\n- other\n\nEnter your reason:');
    if (!reason) return; // Jika user membatalkan
    
    // Validasi alasan
    const validReasons = ['spam', 'harassment', 'inappropriate', 'misleading', 'other'];
    const normalizedReason = reason.toLowerCase().trim();
    
    if (!validReasons.includes(normalizedReason)) {
      alert('Invalid reason. Please choose from: spam, harassment, inappropriate, misleading, other');
      return;
    }
    
    try {
      await apiClient.post(`comment-report/`, {
        comment_id: commentId,
        reason: normalizedReason
      });
      
      alert('Comment reported successfully. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Error reporting comment:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to report comment. Please try again.';
        alert(errorMessage);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Comments ({comments.length})</h2>
      
      {/* Form komentar */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8 dark:bg-gray-800" id="comment-form">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">Add a Comment</h3>
        
        {/* Indikator mode reply */}
        {replyingTo && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-blue-700 dark:text-blue-300">Replying to a comment</p>
              <button 
                onClick={cancelReply}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
            {!isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label htmlFor="author_name" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="author_name"
                    name="author_name"
                    value={newComment.author_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="author_email" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="author_email"
                    name="author_email"
                    value={newComment.author_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Your email"
                  />
                </div>
              </div>
            )}
            {isAuthenticated && (
              <div className="mb-2 p-2 bg-blue-100 rounded dark:bg-blue-800/30">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Reply as: <span className="font-semibold">{user.username}</span>
                </p>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Tidak perlu menampilkan input name/email lagi di sini karena sudah ditampilkan di atas saat mode reply */}
          {(!replyingTo && !isAuthenticated) ? (
            // Form untuk user yang belum login (guest) - hanya tampil jika bukan dalam mode reply
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
          ) : (!replyingTo && isAuthenticated) ? (
            // Info untuk user terotentikasi - hanya tampil jika bukan dalam mode reply
            <div className="mb-4 p-3 bg-blue-50 rounded-md dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Commenting as: <span className="font-semibold">{user.username} ({user.email})</span>
              </p>
            </div>
          ) : null} {/* Jika dalam mode reply, field name/email ditampilkan di atas */}
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

      {/* Form komentar */}
      {replyingTo && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-blue-700 dark:text-blue-300">Replying to a comment</p>
            <button 
              onClick={cancelReply}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
          {!isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label htmlFor="author_name" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  id="author_name"
                  name="author_name"
                  value={newComment.author_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="author_email" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Email *
                </label>
                <input
                  type="email"
                  id="author_email"
                  name="author_email"
                  value={newComment.author_email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Your email"
                />
              </div>
            </div>
          )}
          {isAuthenticated && (
            <div className="mb-2 p-2 bg-blue-100 rounded dark:bg-blue-800/30">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Reply as: <span className="font-semibold">{user.username}</span>
              </p>
            </div>
          )}
        </div>
      )}

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
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <button 
                      onClick={() => startReply(comment.id)}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                      Reply
                    </button>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <button 
                      onClick={() => handleLike(comment.id, comment.likes, comment.user_has_liked)}
                      className={`${comment.user_has_liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'} dark:${comment.user_has_liked ? 'text-red-500' : 'text-gray-400 dark:hover:text-red-400'} transition-colors flex items-center`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${comment.user_has_liked ? 'fill-current' : ''}`} fill={comment.user_has_liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v9M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h2.5" />
                      </svg>
                      {comment.likes || 0}
                    </button>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <button 
                      onClick={() => handleReport(comment.id)}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                      Report
                    </button>
                  </div>
                  
                  {/* Reply komentar */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">{reply.author_name}</h4>
                                <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(reply.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-2">{reply.content}</p>
                              
                              <div className="flex items-center space-x-4 text-sm">
                                <button 
                                  onClick={() => startReply(reply.id)}
                                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                >
                                  Reply
                                </button>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <button 
                                  onClick={() => handleLike(reply.id, reply.likes, reply.user_has_liked)}
                                  className={`${reply.user_has_liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'} dark:${reply.user_has_liked ? 'text-red-500' : 'text-gray-400 dark:hover:text-red-400'} transition-colors flex items-center`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${reply.user_has_liked ? 'fill-current' : ''}`} fill={reply.user_has_liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v9M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h2.5" />
                                  </svg>
                                  {reply.likes || 0}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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