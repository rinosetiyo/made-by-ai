import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';

// Helper to get the full image URL or a placeholder
const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

const ArticleCard = ({ article }) => (
  <div className="group">
    <Link to={`/articles/${article.id}`} className="block">
      <div className="relative bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden dark:bg-gray-800 dark:hover:bg-gray-700">
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700">
          <img src={article.image ? getImageUrl(article.image) : getPlaceholderImage(600, 400, article.title)} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 flex items-center dark:text-gray-400"><span>{article.author_detail?.name || article.author || 'News'}</span><span className="mx-2">•</span><span>{new Date(article.publication_date).toLocaleDateString()}</span></div>
          <h3 className="text-lg font-bold text-gray-800 mt-1 dark:text-white line-clamp-2">{article.title}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 dark:text-gray-300">
            {article.content.substring(0, 100)}...
          </p>
          <div className="text-xs text-gray-500 mt-2 dark:text-gray-400"><span>{article.category?.name || 'General'}</span><span className="mx-2">•</span><span>{article.read_time} min read</span></div>
        </div>
      </div>
    </Link>
  </div>
);

function SearchPage({ searchQuery }) {
  const [searchParams] = useSearchParams();
  const query = searchQuery || searchParams.get('q') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`articles/?search=${encodeURIComponent(query)}`);
        setArticles(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchArticles();
    } else {
      setArticles([]);
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10 dark:text-gray-400">
        Searching articles...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600 mt-2 dark:text-gray-400">
          Found {articles.length} {articles.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg dark:text-gray-300">
            No articles found for "{query}". Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;