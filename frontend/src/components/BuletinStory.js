import React from 'react';

const stories = [
  { name: 'bbcnews', logo: 'https://placehold.co/64x64/f87171/ffffff?text=B' },
  { name: 'ecommurz', logo: 'https://placehold.co/64x64/60a5fa/ffffff?text=E' },
  { name: 'formula_one', logo: 'https://placehold.co/64x64/fbbf24/ffffff?text=F1' },
  { name: 'alvian.de', logo: 'https://placehold.co/64x64/34d399/ffffff?text=A' },
  { name: 'goal', logo: 'https://placehold.co/64x64/a78bfa/ffffff?text=G' },
  { name: 'apple', logo: 'https://placehold.co/64x64/d1d5db/000000?text=A' },
  { name: 'samsung', logo: 'https://placehold.co/64x64/60a5fa/ffffff?text=S' },
  { name: 'idntimes', logo: 'https://placehold.co/64x64/f87171/ffffff?text=IDN' },
];

function BuletinStory() {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Buletin Story</h2>
        <a href="#" className="text-sm font-semibold text-red-600 hover:underline dark:text-red-400">See all →</a>
      </div>
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {stories.map((story) => (
          <div key={story.name} className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mx-auto dark:bg-gray-700">
                <img src={story.logo} alt={story.name} className="w-full h-full object-cover"/>
            </div>
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">{story.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BuletinStory;