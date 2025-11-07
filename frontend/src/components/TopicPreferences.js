import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

const TopicPreferences = ({ onSave = null }) => {
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [newsletterSubscription, setNewsletterSubscription] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all categories and sources
        const [categoriesResponse, sourcesResponse] = await Promise.all([
          apiClient.get('categories/'),
          apiClient.get('sources/')
        ]);
        
        setCategories(categoriesResponse.data);
        setSources(sourcesResponse.data);
        
        // Fetch user preferences if authenticated
        if (user) {
          const preferencesResponse = await apiClient.get('user-preferences/');
          const preferences = preferencesResponse.data;
          
          setSelectedCategories(preferences.preferred_categories_ids || []);
          setSelectedSources(preferences.preferred_sources_ids || []);
          setNewsletterSubscription(preferences.newsletter_subscription);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  const handleCategoryChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSourceChange = (sourceId) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please log in to save preferences');
      return;
    }

    setSaving(true);
    
    try {
      await apiClient.post('user-preferences/', {
        preferred_categories_ids: selectedCategories,
        preferred_sources_ids: selectedSources,
        newsletter_subscription: newsletterSubscription
      });
      
      if (onSave) onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
      <h3 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">Topic Preferences</h3>
      
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2 dark:text-gray-200">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <label key={category.id} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="rounded text-red-600 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2 dark:text-gray-200">Sources</h4>
        <div className="flex flex-wrap gap-2">
          {sources.map(source => (
            <label key={source.id} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedSources.includes(source.id)}
                onChange={() => handleSourceChange(source.id)}
                className="rounded text-red-600 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{source.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={newsletterSubscription}
            onChange={(e) => setNewsletterSubscription(e.target.checked)}
            className="rounded text-red-600 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Subscribe to newsletter</span>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-red-800"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
      
      {saved && (
        <div className="mt-3 text-green-600 text-sm dark:text-green-400">
          Preferences saved successfully!
        </div>
      )}
    </div>
  );
};

export default TopicPreferences;