import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

// Helper to get the full image URL or a placeholder
const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

const BookmarkCard = ({ bookmark, onRemove }) => {
  const article = bookmark.article;

  return (
    <div className="group relative">
      <div className="bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden dark:bg-gray-800 dark:hover:bg-gray-700">
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700">
          <img src={article.image ? getImageUrl(article.image) : getPlaceholderImage(600, 400, article.title)} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <button 
            onClick={() => onRemove(bookmark.id)}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-white dark:bg-gray-800 rounded-full p-1 shadow"
            aria-label="Remove bookmark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="text-xs text-gray-500 flex items-center dark:text-gray-400">
            <span>{article.author_detail?.name || article.author || 'News'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(article.publication_date).toLocaleDateString()}</span>
          </div>
          <Link to={`/articles/${article.id}`} className="block mt-1">
            <h3 className="text-lg font-bold text-gray-800 hover:text-red-600 dark:text-white dark:hover:text-red-400 line-clamp-2">{article.title}</h3>
          </Link>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 dark:text-gray-300">
            {article.content.substring(0, 100)}...
          </p>
          <div className="text-xs text-gray-500 mt-2 dark:text-gray-400">
            <span>{article.category?.name || 'General'}</span>
            <span className="mx-2">•</span>
            <span>{article.read_time} min read</span>
          </div>
          <div className="text-xs text-gray-500 mt-2 dark:text-gray-400 italic">
            Saved: {new Date(bookmark.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        // Untuk sementara, kita asumsikan user dengan ID tertentu
        // Dalam implementasi nyata, Anda mungkin perlu mengelola session/user login
        const response = await apiClient.get('bookmarks/');
        setBookmarks(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch bookmarks. Please try again.');
        console.error('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await apiClient.delete(`bookmarks/${bookmarkId}/`);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      // Mungkin tambahkan pesan error ke UI
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10 dark:text-gray-400">
        Loading bookmarks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10 dark:text-red-400 dark:bg-gray-800">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Articles</h1>
        <p className="text-gray-600 mt-2 dark:text-gray-400">
          You have saved {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg dark:text-gray-300">
            You haven't saved any articles yet. Start bookmarking articles you like!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bookmarks.map(bookmark => (
            <BookmarkCard 
              key={bookmark.id} 
              bookmark={bookmark} 
              onRemove={handleRemoveBookmark} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarkPage;