import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import CommentSection from '../components/CommentSection';
import BookmarkButton from '../components/BookmarkButton';

const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

const RelatedArticleCard = ({ article }) => (
  <div className="group">
    <Link to={`/articles/${article.id}`} className="block">
      <div className="bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden dark:bg-gray-800 dark:hover:bg-gray-700">
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700">
          <img src={article.image ? getImageUrl(article.image) : getPlaceholderImage(600, 400, article.title)} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 flex items-center dark:text-gray-400">
            <span>{article.author_detail?.name || article.author || 'News'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(article.publication_date).toLocaleDateString()}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mt-1 dark:text-white line-clamp-2">{article.title}</h3>
          <div className="text-xs text-gray-500 mt-2 dark:text-gray-400">
            <span>{article.category?.name || 'General'}</span>
            <span className="mx-2">•</span>
            <span>{article.read_time} min read</span>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

function DetailPage() {
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    apiClient.get(`articles/${id}/`).then(response => {
      setArticle(response.data);
    }).catch(error => console.error(`Error fetching article ${id}:`, error));
  }, [id]);

  useEffect(() => {
    if (id) {
      apiClient.get(`articles/${id}/related/`).then(response => {
        setRelatedArticles(response.data);
        setLoadingRelated(false);
      }).catch(error => {
        console.error(`Error fetching related articles for article ${id}:`, error);
        setRelatedArticles([]);
        setLoadingRelated(false);
      });
    }
  }, [id]);

  if (!article) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading article...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <Link to="/" className="text-red-600 hover:underline dark:text-red-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <BookmarkButton articleId={article.id} />
          </div>
          
          <article>
            <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-400">{article.category?.name || 'General'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4 dark:text-white">{article.title}</h1>
            <div className="text-gray-500 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm dark:text-gray-400">
              <span>By <strong className="font-semibold text-gray-700 dark:text-gray-300">{article.author_detail?.name || article.author}</strong></span>
              <span>•</span>
              <span>{new Date(article.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>•</span>
              <span>{article.read_time} min read</span>
            </div>
            
            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[450px] bg-gray-200 rounded-lg mb-6 overflow-hidden dark:bg-gray-700">
              <img 
                src={article.image ? getImageUrl(article.image) : getPlaceholderImage(1200, 600, article.title)}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose prose-lg max-w-none text-gray-800 dark:prose-invert dark:text-gray-300 prose-headings:text-gray-900 prose-headings:dark:text-white prose-a:text-red-600 prose-a:dark:text-red-400">
              <p className="text-lg leading-relaxed">{article.content}</p>
            </div>
          </article>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-6 dark:border-gray-700">
          <CommentSection articleId={id} />
        </div>
      </div>
      
      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedArticles.map(relatedArticle => (
              <RelatedArticleCard key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DetailPage;