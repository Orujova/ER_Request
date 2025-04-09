// File: components/email/EmailHeader.jsx
import React from "react";
import { Search } from "lucide-react";

const EmailHeader = ({ colors }) => {
  return (
    <div
      className="text-white p-3 rounded-lg flex justify-between items-center shadow-sm"
      style={{
        background: `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
      }}
    >
      <div className="text-base font-medium">ER Request Email Management</div>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white " />
        </div>
        <input
          type="text"
          placeholder="Search emails..."
          className="pl-9 pr-4 py-1.5 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white text-sm w-64 bg-opacity-20"
          style={{ backgroundColor: "#9cd3e0" }}
        />
      </div>
    </div>
  );
};

export default EmailHeader;
