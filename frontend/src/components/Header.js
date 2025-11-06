import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import SearchBar from './SearchBar';
import AuthLinks from './AuthLinks';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-red-600 dark:text-red-400">
              Buletin
            </Link>
          </div>
          
          {/* Search Bar - hidden on mobile to make space for menu button */}
          <div className="hidden md:block w-1/3 lg:w-1/4">
            <SearchBar />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link to="/" className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors">Home</Link>
              <Link to="/authors" className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors">Authors</Link>
              <Link to="/bookmarks" className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors">Bookmarks</Link>
            </nav>
            
            <DarkModeToggle />
            <AuthLinks />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar - only show when menu is closed */}
        {!isMenuOpen && (
          <div className="md:hidden py-3">
            <SearchBar />
          </div>
        )}
        
        {/* Mobile navigation menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg py-4 z-50">
            <nav className="flex flex-col space-y-3 px-4">
              <Link 
                to="/" 
                className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 py-2 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/authors" 
                className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 py-2 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Authors
              </Link>
              <Link 
                to="/bookmarks" 
                className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 py-2 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Bookmarks
              </Link>
              <a 
                href="#" 
                className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 py-2 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Subscribe
              </a>
              <a 
                href="#" 
                className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 py-2 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Write
              </a>
            </nav>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-3 px-4">
              <div className="flex justify-between items-center">
                <DarkModeToggle />
                <AuthLinks />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
