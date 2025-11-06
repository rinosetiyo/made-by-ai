import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import AuthorCard from '../components/AuthorCard';

function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [authorArticlesCount, setAuthorArticlesCount] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorsAndArticles = async () => {
      try {
        // Ambil semua authors
        const authorsResponse = await apiClient.get('authors/');
        const authorsData = authorsResponse.data;
        setAuthors(authorsData);

        // Ambil semua articles untuk menghitung jumlah artikel per author
        const articlesResponse = await apiClient.get('articles/');
        const articlesData = articlesResponse.data;

        // Hitung jumlah artikel per author
        const count = {};
        articlesData.forEach(article => {
          if (article.author_detail && article.author_detail.id) {
            const authorId = article.author_detail.id;
            count[authorId] = (count[authorId] || 0) + 1;
          }
        });

        setAuthorArticlesCount(count);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorsAndArticles();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Loading authors...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 dark:text-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 dark:text-white">Our Authors</h1>
      
      {authors.length === 0 ? (
        <div className="text-center text-gray-500 py-10 dark:text-gray-400">No authors found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map(author => (
            <AuthorCard 
              key={author.id} 
              author={author} 
              articleCount={authorArticlesCount[author.id] || 0} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AuthorsPage;