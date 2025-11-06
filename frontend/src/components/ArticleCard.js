import React from 'react';
import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  return (
    <Link to={`/articles/${article.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:hover:bg-gray-700">
        <h3 className="text-xl font-bold text-gray-800 mb-2 dark:text-white">{article.title}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span>By {article.author}</span>
          <span className="mx-2">•</span>
          <span>{new Date(article.publication_date).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
