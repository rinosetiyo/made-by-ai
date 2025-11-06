import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../services/api';

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

const AuthorCard = ({ author }) => (
  <Link to={`/authors/${author.id}`} className="block">
    <div className="relative bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden p-6 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {author.profile_image ? (
            <img 
              src={getImageUrl(author.profile_image)} 
              alt={author.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-500 dark:text-gray-300 font-medium text-2xl">
                {author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{author.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{author.email}</p>
        </div>
      </div>
      {author.bio && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-3 dark:text-gray-300">{author.bio}</p>
      )}
    </div>
  </Link>
);

const CategoryCard = ({ category }) => (
  <Link to={`/categories/${category.id}`} className="block">
    <div className="relative bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden p-6 text-center dark:bg-gray-800 dark:hover:bg-gray-700">
      <div className="flex justify-center mb-4">
        <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{category.name}</h3>
      {category.description && (
        <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">{category.description}</p>
      )}
    </div>
  </Link>
);

const SourceCard = ({ source }) => (
  <Link to={`/`} className="block"> {/* For now, navigate to home since there's no specific source page */}
    <div className="relative bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden p-6 text-center dark:bg-gray-800 dark:hover:bg-gray-700">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{source.name}</h3>
    </div>
  </Link>
);

function SearchPage({ searchQuery }) {
  const [searchParams] = useSearchParams();
  const query = searchQuery || searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState({
    articles: [],
    authors: [],
    categories: [],
    sources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true); // Track if component is mounted

  const getTotalResults = () => 
    searchResults.articles.length + 
    searchResults.authors.length + 
    searchResults.categories.length + 
    searchResults.sources.length;

  useEffect(() => {
    // Set mounted to true when component mounts
    mountedRef.current = true;
    
    const fetchSearchResults = async () => {
      try {
        if (mountedRef.current) setLoading(true);
        const response = await apiClient.get(`multi-search/?q=${encodeURIComponent(query)}`);
        // Only update state if component is still mounted
        if (mountedRef.current) {
          setSearchResults(response.data);
          setError(null);
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (mountedRef.current) {
          setError('Failed to fetch search results. Please try again.');
          console.error('Error fetching search results:', err);
          setSearchResults({
            articles: [],
            authors: [],
            categories: [],
            sources: []
          });
        }
      } finally {
        // Only update state if component is still mounted
        if (mountedRef.current) setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      if (mountedRef.current) {
        setSearchResults({
          articles: [],
          authors: [],
          categories: [],
          sources: []
        });
        setLoading(false);
      }
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [query]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10 dark:text-gray-400">
        Searching...
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

  const totalResults = getTotalResults();

  return (
    <div className="dark:text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600 mt-2 dark:text-gray-400">
          Found {totalResults} total results ({searchResults.articles.length} articles, {searchResults.authors.length} authors, {searchResults.categories.length} categories, {searchResults.sources.length} sources)
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg dark:text-gray-300">
            No results found for "{query}". Try a different search term.
          </p>
        </div>
      ) : (
        <div>
          {/* Articles Section */}
          {searchResults.articles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">Articles ({searchResults.articles.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.articles.map(article => (
                  <ArticleCard key={`article-${article.id}`} article={article} />
                ))}
              </div>
            </div>
          )}

          {/* Authors Section */}
          {searchResults.authors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">Authors ({searchResults.authors.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.authors.map(author => (
                  <AuthorCard key={`author-${author.id}`} author={author} />
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {searchResults.categories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">Categories ({searchResults.categories.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.categories.map(category => (
                  <CategoryCard key={`category-${category.id}`} category={category} />
                ))}
              </div>
            </div>
          )}

          {/* Sources Section */}
          {searchResults.sources.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">Sources ({searchResults.sources.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.sources.map(source => (
                  <SourceCard key={`source-${source.id}`} source={source} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage;