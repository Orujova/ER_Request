// File: components/email/EmailHeader.jsx
import React from "react";
import { Search, Mail, Maximize2, Minimize2 } from "lucide-react";

const EmailHeader = ({ colors, expandedMode, toggleExpandedMode }) => {
  return (
    <div
      className="text-white p-3 rounded-t-lg flex justify-between items-center shadow-sm"
      style={{
        background: `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
      }}
    >
      <div className="flex items-center">
        <Mail className="h-5 w-5 mr-2" />
        <div className="text-base font-medium">ER Request Email Management</div>
      </div>
      <div className="flex items-center">
        <div className="relative mr-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white opacity-70" />
          </div>
          <input
            type="text"
            placeholder="Search emails..."
            className="pl-9 pr-4 py-1.5 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white text-sm w-64 bg-opacity-20"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          />
        </div>
        <button
          onClick={toggleExpandedMode}
          className="px-3 py-1.5 rounded-md text-cyan-600 bg-white flex items-center hover:bg-cyan-50 transition-colors"
          title={expandedMode ? "Collapse Email View" : "Expand Email View"}
        >
          {expandedMode ? (
            <>
              <Minimize2 className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Expand</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailHeader;
