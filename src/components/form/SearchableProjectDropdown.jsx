import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";

// Improved dropdown with search functionality
const SearchableProjectDropdown = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  nullable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm("");
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-left focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`text-sm ${!value ? "text-gray-400" : "text-gray-900"}`}
          >
            {value || placeholder}
          </span>
          <div className="flex items-center gap-2">
            {nullable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideDown">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 pl-9 text-sm rounded-lg border border-gray-200 focus:border-sky-500 focus:outline-none"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={16} />
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {nullable && (
                <div
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all text-sm border-b border-gray-100"
                >
                  <span className="text-gray-500">None</span>
                </div>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all text-sm"
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center text-sm">
                  No options match your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableProjectDropdown;
