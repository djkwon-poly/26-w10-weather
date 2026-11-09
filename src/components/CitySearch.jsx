import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { searchCities } from '../api/weather';

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 400ms 디바운스(Debounce) 적용 - API 호출 남용 및 429 차단 방지
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const data = await searchCities(query.trim());
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('검색 오류:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  // 검색창 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    const formattedName = city.admin1
      ? `${city.name} (${city.admin1})`
      : `${city.name}${city.country ? `, ${city.country}` : ''}`;

    onSelectCity({
      name: formattedName,
      lat: city.latitude,
      lon: city.longitude,
    });
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="도시 이름 검색 (예: Seoul, Tokyo, London, Jeju)..."
          className="search-input"
        />
        {isSearching && <Loader2 size={18} className="search-spinner spinning" />}
        {!isSearching && query && (
          <button type="button" onClick={handleClear} className="clear-btn" title="지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="dropdown-empty">검색 결과가 없습니다. (영문 도시명으로 시도해보세요)</div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.id}-${item.latitude}-${item.longitude}`}
                type="button"
                className="dropdown-item"
                onClick={() => handleSelect(item)}
              >
                <MapPin size={16} className="item-pin" />
                <div className="item-text">
                  <span className="item-name">{item.name}</span>
                  <span className="item-sub">
                    {[item.admin1, item.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

