import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import AuthorsPage from './pages/AuthorsPage';
import AuthorDetailPage from './pages/AuthorDetailPage';
import CategoryPage from './pages/CategoryPage';
import Header from './components/Header';
import Subscription from './components/Subscription';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="bg-white min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/articles/:id" element={<DetailPage />} />
            <Route path="/authors" element={<AuthorsPage />} />
            <Route path="/authors/:id" element={<AuthorDetailPage />} />
            <Route path="/categories/:id" element={<CategoryPage />} />
          </Routes>
          <Subscription />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
