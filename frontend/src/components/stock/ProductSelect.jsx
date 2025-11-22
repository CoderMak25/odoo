import { useState, useRef, useEffect } from 'react';

export default function ProductSelect({ 
  label, 
  value, 
  onChange, 
  options = [], 
  error, 
  required = false,
  placeholder = "Select a product..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Show max 6 items, rest will be scrollable
  const maxVisibleItems = 6;
  const itemHeight = 40; // Approximate height per item
  const maxHeight = maxVisibleItems * itemHeight;

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded-lg border-2 ${
            error ? 'border-rose-500' : 'border-white/10'
          } bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all hover:bg-white/10 text-left flex items-center justify-between`}
        >
          <span className={selectedOption ? 'text-slate-200' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 bg-slate-800 shadow-xl overflow-hidden transition-all duration-200"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: `${maxHeight}px` }}>
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No products available</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                      value === option.value
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

