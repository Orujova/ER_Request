
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X, Loader2 } from "lucide-react";

// Enhanced SearchableDropdown component with loading state
const SearchableDropdown = ({
  label,
  placeholder,
  value,
  onSearch,
  onSelect,
  options,
  disabled = false,
  searchQuery = "",
  setSearchQuery,
  allowClear = true,
  isLoading = false, // Added loading state
}) => {
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    if (setSearchQuery) {
      setSearchQuery("");
    }
    onSelect(null);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          <input
            type="text"
            className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl border-2 border-gray-200 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all ${
              disabled || isLoading
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-white"
            }`}
            placeholder={isLoading ? "Loading options..." : placeholder}
            value={value || searchQuery}
            onChange={(e) => {
              if (setSearchQuery) {
                setSearchQuery(e.target.value);
              }
              onSearch(e.target.value);
            }}
            onFocus={() => !disabled && !isLoading && setShowResults(true)}
            disabled={disabled || isLoading}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {allowClear && !isLoading && (value || searchQuery) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <X size={18} />
              </button>
            )}
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-300 ${
                showResults ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {showResults && !isLoading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 animate-slideDown">
            {options.length > 0 ? (
              options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    onSelect(option);
                    setShowResults(false);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all text-sm"
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center text-sm">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
