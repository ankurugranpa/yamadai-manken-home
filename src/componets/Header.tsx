import React from 'react';
import { Link } from 'react-router';

export function Header() {

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-gray-900">
              山大漫研
            </Link>
          </div>


        </div>

      </div>
    </header>
  );
}