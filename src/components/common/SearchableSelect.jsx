import { ChevronDown, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  // Filter options when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Get currently selected option name
  const selectedOption = options.find((opt) => String(opt.id) === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1.5 text-gray-700">
        {label}
      </label>

      <div
        className={`w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md flex justify-between items-center text-left
       
          transition-all duration-200 cursor-pointer ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="truncate text-sm">
          {selectedOption ? (
            selectedOption.name
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-cyan-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <Search
                size={16}
                className="absolute left-2.5 top-2 text-gray-400"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-cyan-50 
                    ${
                      value === String(option.id)
                        ? "bg-cyan-50 font-medium"
                        : ""
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(String(option.id));
                    setIsOpen(false);
                  }}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
