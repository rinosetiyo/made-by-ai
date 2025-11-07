import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import debounce from '../utils/debounce';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    articles: [],
    authors: [],
    categories: [],
    sources: []
  });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // For keyboard navigation
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true); // Track if component is mounted

  // Fetch multi-field search results with debounce
  const fetchSearchResults = async (query) => {
    if (query.trim()) {
      setLoading(true);
      try {
        const response = await apiClient.get(`multi-search/?q=${encodeURIComponent(query)}`);
        // Only update state if the component is still mounted
        if (mountedRef.current) {
          setSearchResults(response.data);
          setActiveIndex(-1); // Reset active index when results update
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        // Only update state if the component is still mounted
        if (mountedRef.current) {
          setSearchResults({
            articles: [],
            authors: [],
            categories: [],
            sources: []
          });
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    } else {
      if (mountedRef.current) {
        setSearchResults({
          articles: [],
          authors: [],
          categories: [],
          sources: []
        });
      }
    }
  };

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query) => {
      await fetchSearchResults(query);
    }, 300) // 300ms delay
  ).current;

  useEffect(() => {
    // Set mounted to true when component mounts
    mountedRef.current = true;
    
    // Close results when clicking outside
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Set mounted to false when component unmounts
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setShowResults(true);
      debouncedSearch(searchQuery);
    } else {
      setSearchResults({
        articles: [],
        authors: [],
        categories: [],
        sources: []
      });
      setShowResults(false);
    }

    // Cleanup function to cancel any pending requests if component unmounts
    return () => {
      // We can't easily cancel the debounced function, but we can ensure state doesn't update after unmount
    };
  }, [searchQuery, debouncedSearch]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const navigateToResult = (type, id) => {
    switch (type) {
      case 'article':
        navigate(`/articles/${id}`);
        break;
      case 'author':
        navigate(`/authors/${id}`);
        break;
      case 'category':
        navigate(`/categories/${id}`);
        break;
      case 'source':
        // If we have a page for sources, navigate there
        // For now, we'll go to the home page filtered by source
        navigate(`/`);
        break;
      default:
        break;
    }
    setShowResults(false);
    setSearchQuery(''); // Clear search after clicking
  };

  const getTotalResults = () => 
    searchResults.articles.length + 
    searchResults.authors.length + 
    searchResults.categories.length + 
    searchResults.sources.length;

  const handleKeyDown = (e) => {
    const totalResults = getTotalResults();
    if (!showResults || totalResults === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < totalResults - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : totalResults - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          // Determine which result type and index to navigate to
          let currentIdx = 0;
          
          // Check if it's an article
          if (activeIndex < searchResults.articles.length) {
            navigateToResult('article', searchResults.articles[activeIndex].id);
          } else {
            currentIdx += searchResults.articles.length;
            
            // Check if it's an author
            if (activeIndex < currentIdx + searchResults.authors.length) {
              navigateToResult('author', searchResults.authors[activeIndex - currentIdx].id);
            } else {
              currentIdx += searchResults.authors.length;
              
              // Check if it's a category
              if (activeIndex < currentIdx + searchResults.categories.length) {
                navigateToResult('category', searchResults.categories[activeIndex - currentIdx].id);
              } else {
                // It's a source
                navigateToResult('source', searchResults.sources[activeIndex - currentIdx - searchResults.categories.length].id);
              }
            }
          }
        }
        break;
      case 'Escape':
        setShowResults(false);
        if (inputRef.current) inputRef.current.blur();
        break;
      default:
        break;
    }
  };

  // Helper to get the full image URL or a placeholder
  const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
  const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

  return (
    <div className="w-full relative" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery.trim() && setShowResults(true)}
            placeholder="Search articles, authors, categories..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Live Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          ) : getTotalResults() === 0 && searchQuery.trim() ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}"
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {/* Articles Section */}
              {searchResults.articles.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                    Articles
                  </div>
                  <ul>
                    {searchResults.articles.map((article, index) => {
                      const globalIndex = index;
                      const isActive = activeIndex === globalIndex;
                      
                      return (
                        <li 
                          key={`article-${article.id}`}
                          className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors duration-150 ${
                            isActive 
                              ? 'bg-red-100 dark:bg-red-900/30' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => navigateToResult('article', article.id)}
                        >
                          <div className="p-3 flex items-start">
                            <div className="w-12 h-12 flex-shrink-0 mr-3">
                              <img 
                                src={article.image ? getImageUrl(article.image) : getPlaceholderImage(48, 48, article.title.charAt(0))}
                                alt={article.title}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {article.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                By {article.author_detail?.name || article.author}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(article.publication_date).toLocaleDateString()} • {article.read_time} min read
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Authors Section */}
              {searchResults.authors.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                    Authors
                  </div>
                  <ul>
                    {searchResults.authors.map((author, index) => {
                      const globalIndex = searchResults.articles.length + index;
                      const isActive = activeIndex === globalIndex;
                      
                      return (
                        <li 
                          key={`author-${author.id}`}
                          className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors duration-150 ${
                            isActive 
                              ? 'bg-red-100 dark:bg-red-900/30' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => navigateToResult('author', author.id)}
                        >
                          <div className="p-3 flex items-start">
                            <div className="w-12 h-12 flex-shrink-0 mr-3">
                              {author.profile_image ? (
                                <img 
                                  src={getImageUrl(author.profile_image)} 
                                  alt={author.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-300 font-medium">
                                    {author.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {author.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                {author.email}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Categories Section */}
              {searchResults.categories.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                    Categories
                  </div>
                  <ul>
                    {searchResults.categories.map((category, index) => {
                      const globalIndex = searchResults.articles.length + searchResults.authors.length + index;
                      const isActive = activeIndex === globalIndex;
                      
                      return (
                        <li 
                          key={`category-${category.id}`}
                          className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors duration-150 ${
                            isActive 
                              ? 'bg-red-100 dark:bg-red-900/30' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => navigateToResult('category', category.id)}
                        >
                          <div className="p-3 flex items-start">
                            <div className="w-12 h-12 flex-shrink-0 mr-3 flex items-center justify-center">
                              <div className="bg-red-100 dark:bg-red-900/30 w-10 h-10 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {category.name}
                              </h4>
                              {category.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Sources Section */}
              {searchResults.sources.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                    Sources
                  </div>
                  <ul>
                    {searchResults.sources.map((source, index) => {
                      const globalIndex = searchResults.articles.length + searchResults.authors.length + searchResults.categories.length + index;
                      const isActive = activeIndex === globalIndex;
                      
                      return (
                        <li 
                          key={`source-${source.id}`}
                          className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors duration-150 ${
                            isActive 
                              ? 'bg-red-100 dark:bg-red-900/30' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => navigateToResult('source', source.id)}
                        >
                          <div className="p-3 flex items-start">
                            <div className="w-12 h-12 flex-shrink-0 mr-3">
                              {source.logo ? (
                                <img 
                                  src={getImageUrl(source.logo)} 
                                  alt={source.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-300 font-medium text-xs">
                                    {source.name.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {source.name}
                              </h4>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;