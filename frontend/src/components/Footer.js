import React from 'react';

const FooterLink = ({ children }) => <a href="#" className="text-gray-500 hover:text-gray-800">{children}</a>;

function Footer() {
  const linkSections = {
    Business: ['Startup', 'Employee', 'Success', 'Videos', 'Markets'],
    Technology: ['Innovate', 'Gadget', 'Innovative Cities', 'Upstarts', 'Future Tech'],
    Travel: ['Destinations', 'Food & Drink', 'Stay', 'News', 'Videos'],
    Sports: ['Football', 'Tennis', 'Golf', 'Motosports', 'Esports'],
    Entertainment: ['Movies', 'Art', 'Television', 'Influencer', 'Viral'],
    Features: ['As Equals', 'Call to Earth', 'Freedom Project', 'Inside Asia', '2 Degress'],
    Weather: ['Climate', 'Strom Tracker', 'Wildfire Tracker', 'Earthquake', 'Video'],
    More: ['Design', 'Mentorship', 'Investment', 'Work for Buletin', 'Support Us'],
  };

  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-8">
          <div className="col-span-2 lg:col-span-2 pr-8">
            <h2 className="text-2xl font-bold text-red-600">Buletin</h2>
            <p className="text-sm text-gray-500 mt-2">Craft narratives that ignite inspiration, knowledge, and entertainment.</p>
            {/* Social links can go here */}
          </div>
          {Object.entries(linkSections).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {links.map(link => <li key={link}><FooterLink>{link}</FooterLink></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          <p>Copyright © 2023 Buletin.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
