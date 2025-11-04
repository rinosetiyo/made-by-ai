import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

function AuthorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil detail author
        const authorResponse = await apiClient.get(`authors/${id}/`);
        setAuthor(authorResponse.data);

        // Ambil artikel yang ditulis oleh author ini
        const articlesResponse = await apiClient.get(`authors/${id}/articles/`);
        setArticles(articlesResponse.data);
      } catch (err) {
        setError('Failed to fetch author data');
        console.error('Error fetching author data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Loading author details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (!author) {
    return <div className="text-center text-gray-500 py-10">Author not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="text-red-600 hover:underline mb-6 flex items-center"
      >
        ← Back to previous page
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mr-8 mb-4 md:mb-0">
            {author.profile_image ? (
              <img 
                src={getImageUrl(author.profile_image)} 
                alt={author.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={getPlaceholderImage(128, 128, author.name.charAt(0).toUpperCase())} 
                alt={author.name} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>
            <p className="text-gray-600 mb-4">{author.email}</p>
            {author.bio && (
              <p className="text-gray-700 mb-4">{author.bio}</p>
            )}
            <p className="text-gray-500 text-sm">Member since {new Date(author.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Articles by {author.name} <span className="text-gray-500">({articles.length})</span>
        </h2>
        
        {articles.length === 0 ? (
          <p className="text-gray-500">No articles written by this author yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link key={article.id} to={`/articles/${article.id}`} className="block">
                <div className="bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden border border-gray-200">
                  <div className="w-full h-48 bg-gray-200">
                    <img 
                      src={article.image ? getImageUrl(article.image) : getPlaceholderImage(600, 400, article.title)} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{article.title}</h3>
                    <div className="text-xs text-gray-500 mb-1">
                      <span>{new Date(article.publication_date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span>{article.category?.name || 'General'}</span>
                      <span className="mx-2">•</span>
                      <span>{article.read_time} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorDetailPage;