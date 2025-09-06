import React from 'react';

const sampleBooks = [
  {
    id: '1',
    title: 'サンプル本1',
    cover: '/src/assets/to_loveru_color.svg',
    pages: ['/src/assets/to_loveru_color.svg', '/src/assets/to_loveru_line.svg']
  },
  {
    id: '2', 
    title: 'サンプル本2',
    cover: '/src/assets/19.png',
    pages: ['/src/assets/19.png', '/src/assets/b5.png']
  }
];

export function Bookshelf() {
  const handleBookSelect = (bookId: string) => {
    // 本を選択したらその本のページに遷移
    window.location.href = `/book/${bookId}`;
  };

  return (
    <div className="h-full w-full p-8">
      <h1 className="text-3xl font-bold text-center mb-8">本棚</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {sampleBooks.map((book) => (
          <div 
            key={book.id}
            onClick={() => handleBookSelect(book.id)}
            className="cursor-pointer group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-sm text-center">{book.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}