import { Search, ExternalLink } from 'lucide-react';

export default function SearchResults({ query, results }) {
  if (!query && (!results || results.length === 0)) return null;

  return (
    <div className="mb-4">
      {/* Search Query Indicator */}
      {query && (
        <div className="mb-3 flex items-center gap-2 text-gray-400 text-sm">
          <Search size={16} />
          <span>Поиск «{query}»</span>
        </div>
      )}

      {/* Search Results Cards */}
      {results && results.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Свежие новости технологий и игровой индустрии
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {results.map((result, index) => (
              <a
                key={index}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1A232E] border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all group"
              >
                {/* Image */}
                {result.image && (
                  <div className="w-full h-32 bg-gray-800 overflow-hidden">
                    <img 
                      src={result.image} 
                      alt={result.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-3">
                  {/* Source */}
                  <div className="flex items-center gap-2 mb-2">
                    {result.favicon && (
                      <img 
                        src={result.favicon} 
                        alt=""
                        className="w-4 h-4 rounded"
                      />
                    )}
                    <span className="text-xs text-gray-400">{result.source}</span>
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {result.title}
                  </h4>

                  {/* Date */}
                  {result.date && (
                    <p className="text-xs text-gray-500">{result.date}</p>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* View More Link */}
          <div className="mt-3">
            <p className="text-xs text-gray-400">
              Вот несколько интересных новостей и тенденций из интернет-пространства, которые могут быть полезны тебе:
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
