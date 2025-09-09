import { Link } from 'react-router';

export function Header() {

  return (
    <header className="relative shadow-md overflow-hidden w-full h-12">
      {/* Background Image */}
      {/* src="/src/assets/edo.jpeg"  */}
      <img 
        src="/src/assets/edo-heater-noword.png" 
        alt="Header background"
        className="w-full h-auto block"
        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-neutral-700/80"></div>
      
      {/* Content */}
      <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex justify-between items-center w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-neutral-50">
              MATSU NI TSURU
            </Link>
          </div>


        </div>
      </div>
    </header>
  );
}