import React, { useState, useRef, useEffect } from 'react';

const renderFlagImage = (code, className = "w-5 h-3.5 object-cover rounded-sm shadow-sm inline-block") => {
  if (!code) return null;
  const lowerCode = code.toLowerCase();
  const url = lowerCode === 'un' 
    ? 'https://flagcdn.com/w40/un.png' 
    : `https://flagcdn.com/w40/${lowerCode}.png`;
  return (
    <img 
      src={url} 
      alt={code} 
      className={className} 
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
};

export const CountrySelect = ({ value, onChange, countries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedCountry = countries.find(c => c.code === value) || countries[0];

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active keyboard index when search or open state changes
  useEffect(() => {
    setActiveIndex(-1);
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchQuery]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      setActiveIndex(prev => {
        const next = prev + 1 >= filteredCountries.length ? 0 : prev + 1;
        scrollActiveItemIntoView(next);
        return next;
      });
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setActiveIndex(prev => {
        const next = prev - 1 < 0 ? filteredCountries.length - 1 : prev - 1;
        scrollActiveItemIntoView(next);
        return next;
      });
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filteredCountries.length) {
        onChange(filteredCountries[activeIndex]);
        setIsOpen(false);
      }
      e.preventDefault();
    }
  };

  const scrollActiveItemIntoView = (index) => {
    if (!listRef.current) return;
    const activeItem = listRef.current.childNodes[index];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full text-left" 
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-4 py-2.5 rounded-xl text-[14px] text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {renderFlagImage(selectedCountry.code, "w-6 h-4 object-cover rounded shadow border border-slate-300 dark:border-panel-border shrink-0")}
          <span>{selectedCountry.name}</span>
        </div>
        <span className="text-slate-500 text-[12px] ml-2">▼</span>
      </button>

      {/* Dropdown Menu Container */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#121420] border border-slate-300 dark:border-panel-border rounded-xl shadow-2xl z-[1500] overflow-hidden flex flex-col max-h-[260px]">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-slate-200 dark:border-panel-border bg-slate-50 dark:bg-white/[0.02]">
            <input
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-3 py-1.5 rounded-lg text-[13px] text-slate-900 dark:text-white outline-none focus:border-purple-500"
              autoFocus
            />
          </div>

          {/* Country list */}
          <div 
            ref={listRef}
            className="overflow-y-auto grow py-1 text-[13.5px]"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c, index) => {
                const isSelected = c.code === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' 
                        : isActive 
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    {renderFlagImage(c.code, "w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0")}
                    <span className="grow">{c.name}</span>
                    {isSelected && <span className="text-[12px] text-purple-500">✓</span>}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-[13px] text-slate-500 dark:text-text-secondary text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
