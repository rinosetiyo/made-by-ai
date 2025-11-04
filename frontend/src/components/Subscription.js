import React, { useState } from 'react';
import apiClient from '../services/api';

function Subscription() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('subscribe/', { email });
      setMessage('Thank you for subscribing!');
      setError('');
      setEmail('');
    } catch (err) {
      setError('Subscription failed. Please try again.');
      setMessage('');
    }
  };

  return (
    <section className="bg-gray-100 rounded-lg p-8 my-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-sm font-bold text-red-600">GET FIRST UPDATE</h2>
        <p className="text-3xl font-bold text-gray-900 mt-2">Get the news in front line by <span className="text-red-600">subscribe</span> our latest updates</p>
        {message && <p className="text-green-600 mt-4">{message}</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}
        <form className="mt-6 flex max-w-md mx-auto" onSubmit={handleSubmit}>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email" 
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <button type="submit" className="bg-red-600 text-white font-bold p-3 rounded-r-md hover:bg-red-700">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default Subscription;
