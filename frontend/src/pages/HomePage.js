import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import BuletinStory from '../components/BuletinStory';
import CategoryFilter from '../components/CategoryFilter';
import BookmarkButton from '../components/BookmarkButton';

// Helper to get the full image URL or a placeholder
const getImageUrl = (path) => `http://127.0.0.1:8000${path}`;
const getPlaceholderImage = (width, height, text = "No Image") => `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(text)}`;

const HeroArticle = ({ article }) => (
    <div className="relative group">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
            <div className="w-full h-80 md:h-auto bg-gray-200 rounded-lg overflow-hidden dark:bg-gray-700">
                <img src={article.image ? getImageUrl(article.image) : getPlaceholderImage(1200, 600, article.title)} alt={article.title} className="w-full h-full object-cover" />
            </div>
            <div>
                <div className="flex justify-end mb-4">
                    <BookmarkButton articleId={article.id} />
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2 dark:text-gray-400">
                    <span>{article.author_detail?.name || article.author || 'News'}</span><span className="mx-2">•</span><span>{new Date(article.publication_date).toLocaleDateString()}</span>
                </div>
                <Link to={`/articles/${article.id}`}><h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight hover:text-red-600 dark:text-white dark:hover:text-red-400 line-clamp-2">{article.title}</h1></Link>
                <p className="text-gray-600 mt-4 dark:text-gray-300 line-clamp-3">{article.content.substring(0, 150)}...</p>
                <div className="text-sm text-gray-500 mt-2 dark:text-gray-400">
                    <span>{article.category?.name || 'General'}</span><span className="mx-2">•</span><span>{article.read_time} min read</span>
                </div>
            </div>
        </div>
    </div>
);

const ArticleCard = ({ article }) => (
    <div className="group">
        <Link to={`/articles/${article.id}`} className="block">
            <div className="relative bg-white h-full hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden dark:bg-gray-800 dark:hover:bg-gray-700">
                <div className="relative">
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700">
                        <img src={article.image ? getImageUrl(article.image) : getPlaceholderImage(600, 400, article.title)} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BookmarkButton articleId={article.id} />
                    </div>
                </div>
                <div className="p-4">
                    <div className="text-xs text-gray-500 flex items-center dark:text-gray-400"><span>{article.author_detail?.name || article.author || 'News'}</span><span className="mx-2">•</span><span>{new Date(article.publication_date).toLocaleDateString()}</span></div>
                    <h3 className="text-lg font-bold text-gray-800 mt-1 dark:text-white line-clamp-2">{article.title}</h3>
                    <div className="text-xs text-gray-500 mt-2 dark:text-gray-400"><span>{article.category?.name || 'General'}</span><span className="mx-2">•</span><span>{article.read_time} min read</span></div>
                </div>
            </div>
        </Link>
    </div>
);

const Section = ({ title, children }) => (
    <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <a href="#" className="text-sm font-semibold text-red-600 hover:underline dark:text-red-400">See all →</a>
        </div>
        {children}
    </section>
);

function HomePage() {
    const [articles, setArticles] = useState([]);
    const [sources, setSources] = useState([]);

    useEffect(() => {
        apiClient.get('articles/').then(response => {
            setArticles(response.data);
        }).catch(error => console.error('Error fetching articles:', error));

        apiClient.get('sources/').then(response => {
            setSources(response.data);
        }).catch(error => console.error('Error fetching sources:', error));
    }, []);

    if (articles.length === 0) {
        return <div className="text-center text-gray-500 py-10 dark:text-gray-400">Loading...</div>;
    }

    const [heroArticle, ...otherArticles] = articles;
    const latestNews = otherArticles.slice(0, 4);
    const businessArticles = articles.filter(a => a.category?.name === 'Business').slice(0, 4);
    const sportsArticles = articles.filter(a => a.category?.name === 'Sports').slice(0, 4);

    return (
        <div>
            <CategoryFilter />
            {heroArticle && <HeroArticle article={heroArticle} />}
            
            <Section title="Latest News">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {latestNews.map(article => <ArticleCard key={article.id} article={article} />)}
                </div>
            </Section>

            <BuletinStory sources={sources} />

            {businessArticles.length > 0 && (
                <Section title="Business">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {businessArticles.map(article => <ArticleCard key={article.id} article={article} />)}
                    </div>
                </Section>
            )}

            {sportsArticles.length > 0 && (
                <Section title="Sport News">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {sportsArticles.map(article => <ArticleCard key={article.id} article={article} />)}
                    </div>
                </Section>
            )}
        </div>
    );
}

export default HomePage;