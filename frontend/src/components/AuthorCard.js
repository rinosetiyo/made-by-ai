import React from 'react';
import { Link } from 'react-router-dom';

function AuthorCard({ author, articleCount }) {
  const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
  const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

  return (
    <Link to={`/authors/${author.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {author.profile_image ? (
              <img 
                src={getImageUrl(author.profile_image)} 
                alt={author.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={getPlaceholderImage(64, 64, author.name.charAt(0).toUpperCase())} 
                alt={author.name} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-800">{author.name}</h3>
            <p className="text-sm text-gray-500">{author.email}</p>
          </div>
        </div>
        {author.bio && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-3">{author.bio}</p>
        )}
        <div className="mt-3 text-sm text-gray-600">
          <span className="inline-block bg-gray-100 rounded-full px-3 py-1">
            {articleCount !== undefined ? articleCount : 0} article{articleCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default AuthorCard;