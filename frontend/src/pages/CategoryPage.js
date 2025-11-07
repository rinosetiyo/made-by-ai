import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';

function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil detail kategori
        const categoryResponse = await apiClient.get(`categories/${id}/`);
        setCategory(categoryResponse.data);
        
        // Ambil artikel dalam kategori ini
        const articlesResponse = await apiClient.get(`categories/${id}/articles/`);
        setArticles(articlesResponse.data);
        
        // Jika kategori ini adalah kategori induk, ambil sub-kategorinya
        if (categoryResponse.data.subcategories && categoryResponse.data.subcategories.length > 0) {
          setSubcategories(categoryResponse.data.subcategories);
        }
      } catch (err) {
        setError('Failed to fetch category data');
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-500 py-10 dark:text-gray-400">Loading category...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10 dark:text-red-400">{error}</div>;
  }

  if (!category) {
    return <div className="text-center text-gray-500 py-10 dark:text-gray-400">Category not found</div>;
  }

  const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
  const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

  const ArticleCard = ({ article }) => (
    <Link to={`/articles/${article.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 dark:hover:bg-gray-700 hover:shadow-lg transition-shadow duration-300">
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700">
          <img 
            src={article.image ? getImageUrl(article.image) : getPlaceholderImage(400, 300, article.title)} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center text-sm text-gray-500 mb-2 dark:text-gray-400">
            <span>{article.source?.name || 'News'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(article.publication_date).toLocaleDateString()}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2 dark:text-white hover:text-red-600 dark:hover:text-red-400">{article.title}</h3>
          <p className="text-gray-600 text-sm mb-2 dark:text-gray-300">{article.content.substring(0, 100)}...</p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>{article.category?.name || 'General'}</span>
            <span className="mx-2">•</span>
            <span>{article.read_time} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const SubcategoryCard = ({ subcategory }) => (
    <Link to={`/categories/${subcategory.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 hover:scale-[1.02] transition-transform">
        <h3 className="text-lg font-bold text-gray-800 mb-2 dark:text-white hover:text-red-600 dark:hover:text-red-400">{subcategory.name}</h3>
        <p className="text-gray-600 text-sm mb-3 dark:text-gray-300">{subcategory.description}</p>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span>Created: {new Date(subcategory.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 dark:text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">{category.name}</h1>
        {category.description && <p className="text-gray-600 dark:text-gray-300">{category.description}</p>}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {category.parent_name && (
            <span>Subcategory of: <span className="font-semibold dark:text-white">{category.parent_name}</span></span>
          )}
          {!category.parent_name && <span>Main Category</span>}
        </div>
      </div>

      {/* Subcategories Section */}
      {subcategories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Subcategories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map(subcategory => (
              <SubcategoryCard key={subcategory.id} subcategory={subcategory} />
            ))}
          </div>
        </section>
      )}

      {/* Articles Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
          Articles in {category.name} <span className="text-gray-500 dark:text-gray-400">({articles.length})</span>
        </h2>
        
        {articles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No articles found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CategoryPage;