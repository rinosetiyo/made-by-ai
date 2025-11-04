import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-red-600">
              Buletin
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-red-600">Stories</a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-red-600">Creator</a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-red-600">Community</a>
            <a href="/authors" className="text-sm font-medium text-gray-700 hover:text-red-600">Authors</a>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-red-600">Subscribe</a>
          </nav>
          <div className="flex items-center space-x-2">
             <a href="#" className="text-sm font-medium text-gray-700 hover:text-red-600">Write</a>
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
             <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
