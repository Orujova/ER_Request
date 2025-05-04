import React, { useState } from "react";
import { Search, Mail, Maximize2, Minimize2 } from "lucide-react";

const EmailHeader = ({ colors, expandedMode, toggleExpandedMode }) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div
      className="text-white p-2 rounded-t-lg flex justify-between items-center shadow-sm"
      style={{
        background: `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
      }}
    >
      <div className="flex items-center">
        <Mail className="h-4 w-4 mr-2" />
        <div className="text-sm font-medium truncate">Email Management</div>
      </div>
      <div className="flex items-center space-x-2">
        {showSearch ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-3 w-3 text-white opacity-70" />
            </div>
            <input
              type="text"
              placeholder="Search emails..."
              className="pl-7 pr-2 py-1 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white text-xs w-48 bg-opacity-20"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            title="Search emails"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={toggleExpandedMode}
          className="px-2 py-1 rounded-md text-cyan-600 bg-white flex items-center hover:bg-cyan-50 transition-colors"
          title={expandedMode ? "Collapse Email View" : "Expand Email View"}
        >
          {expandedMode ? (
            <>
              <Minimize2 className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">Expand</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailHeader;
