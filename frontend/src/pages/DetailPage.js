import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import CommentSection from '../components/CommentSection';

const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

function DetailPage() {
  const [article, setArticle] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    apiClient.get(`articles/${id}/`).then(response => {
      setArticle(response.data);
    }).catch(error => console.error(`Error fetching article ${id}:`, error));
  }, [id]);

  if (!article) {
    return <div className="text-center text-gray-500">Loading article...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <Link to="/" className="text-red-600 hover:underline mb-6 block">← Back to Home</Link>
      
      <article>
        <div className="mb-4">
            <span className="text-sm font-semibold text-red-600">{article.category?.name || 'General'}</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">{article.title}</h1>
        <div className="text-gray-500 mb-8 flex items-center space-x-4">
          <span>By <strong className="font-semibold text-gray-700">{article.author_detail?.name || article.author}</strong></span>
          <span>•</span>
          <span>{new Date(article.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
           <span>•</span>
          <span>{article.read_time} min read</span>
        </div>
        
        <div className="w-full h-96 bg-gray-200 rounded-lg mb-8 overflow-hidden">
             <img 
                src={article.image ? getImageUrl(article.image) : getPlaceholderImage(1200, 600, article.title)}
                alt={article.title}
                className="w-full h-full object-cover"
            />
        </div>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>{article.content}</p>
        </div>
      </article>
      
      <CommentSection articleId={id} />
    </div>
  );
}

export default DetailPage;