import React from 'react';
import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  return (
    <Link to={`/articles/${article.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{article.title}</h3>
        <div className="text-sm text-gray-500">
          <span>By {article.author}</span>
          <span className="mx-2">•</span>
          <span>{new Date(article.publication_date).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
