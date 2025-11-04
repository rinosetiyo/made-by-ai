import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

function CategoryFilter() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    
    if (categoryId) {
      navigate(`/categories/${categoryId}`);
    } else {
      navigate('/'); // Kembali ke halaman utama jika tidak ada kategori dipilih
    }
  };

  // Filter hanya kategori utama (yang tidak memiliki parent)
  const mainCategories = categories.filter(cat => cat.parent === null);

  return (
    <div className="mb-8">
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Category:
      </label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
      >
        <option value="">All Categories</option>
        {mainCategories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CategoryFilter;