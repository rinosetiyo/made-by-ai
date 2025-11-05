import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else if (location.pathname.includes('/search')) {
      navigate('/'); // Kembali ke halaman utama jika pencarian dikosongkan di halaman hasil
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Melakukan pencarian otomatis saat pengguna mengetik (opsional)
    // Anda bisa menambahkan debounce di sini untuk kinerja yang lebih baik
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search articles..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
  );
};

export default SearchBar;