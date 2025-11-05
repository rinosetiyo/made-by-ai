import React from 'react';
import { BrowserRouter as Router, Route, Routes, useSearchParams } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import AuthorsPage from './pages/AuthorsPage';
import AuthorDetailPage from './pages/AuthorDetailPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import BookmarkPage from './pages/BookmarkPage';
import Header from './components/Header';
import Subscription from './components/Subscription';
import Footer from './components/Footer';

// Wrapper component for SearchPage to handle query parameters
function SearchPageWrapper() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  return <SearchPage searchQuery={q} />;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="bg-white min-h-screen dark:bg-gray-900 dark:text-white">
          <Header />
          <main className="max-w-7xl mx-auto py-8 px-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/articles/:id" element={<DetailPage />} />
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/authors/:id" element={<AuthorDetailPage />} />
              <Route path="/categories/:id" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPageWrapper />} />
              <Route path="/bookmarks" element={<BookmarkPage />} />
            </Routes>
            <Subscription />
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
