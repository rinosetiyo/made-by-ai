import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

const BookmarkButton = ({ articleId, isBookmarked: initialIsBookmarked = false }) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // If not authenticated, reset to non-bookmarked state
      setIsBookmarked(initialIsBookmarked);
      return;
    }
    
    // Cek apakah artikel sudah di-bookmark saat komponen dimuat
    const checkBookmarkStatus = async () => {
      try {
        const response = await apiClient.get(`articles/${articleId}/bookmarks/`);
        setIsBookmarked(response.data && response.data.id); // Jika responsi berisi bookmark, berarti sudah di-bookmark
      } catch (error) {
        // Jika error (misalnya 404 karena belum di-bookmark atau 401 karena belum login), set ke false
        if (error.response?.status === 404) {
          setIsBookmarked(false);
        } else if (error.response?.status === 401) {
          // User not authenticated, redirect to login
          navigate('/login');
        }
      }
    };

    if (articleId && isAuthenticated) {
      checkBookmarkStatus();
    } else {
      setIsBookmarked(false);
    }
  }, [articleId, isAuthenticated, navigate]);

  const handleBookmarkToggle = async () => {
    if (loading) return; // Mencegah multiple click saat loading
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      if (isBookmarked) {
        // Hapus bookmark
        await apiClient.delete(`articles/${articleId}/bookmarks/`);
        setIsBookmarked(false);
      } else {
        // Tambahkan bookmark
        await apiClient.post(`articles/${articleId}/bookmarks/`);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (error.response?.status === 401) {
        // User not authenticated, redirect to login
        navigate('/login');
      }
      // Mungkin tambahkan pesan error ke UI
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="p-2 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Login to bookmark"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleBookmarkToggle}
      disabled={loading}
      className={`p-2 rounded-full ${isBookmarked ? 'text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'} hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {loading ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} 
          fill={isBookmarked ? "currentColor" : "none"} 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      )}
    </button>
  );
};

export default BookmarkButton;