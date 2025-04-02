// src/components/requestMatrix/DisciplinarySearchBar.jsx
import React from "react";
import { Search, X } from "lucide-react";
import { themeColors } from "../../styles/theme";

const DisciplinarySearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} strokeWidth={2} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full rounded-lg py-2.5 px-4 focus:outline-none transition-all duration-200"
          style={{
            border: `1px solid ${themeColors.border}`,
            backgroundColor: themeColors.background,
            color: themeColors.text,
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = `0 0 0 3px ${themeColors.primaryLight}20`;
            e.target.style.borderColor = themeColors.primaryLight;
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "none";
            e.target.style.borderColor = themeColors.border;
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X
              size={18}
              strokeWidth={2}
              className="text-gray-400 hover:text-gray-600"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default DisciplinarySearchBar;
