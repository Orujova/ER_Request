// File: components/Header.jsx
import React from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { themeColors } from "../../styles/theme";

const Header = ({ id, request, navigateToDetail }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Under Review":
        return "bg-amber-100 text-amber-800";
      case "Decision Made":
        return "bg-blue-100 text-blue-800";
      case "Order Created":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div
      className="bg-background rounded-xl shadow-sm p-6 mb-6"
      style={{ boxShadow: themeColors.cardShadow }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text">Request #{id}</h1>
            {request && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  request.status
                )}`}
              >
                {request.status}
              </span>
            )}
          </div>
          <p className="text-textLight">
            Manage request actions and employee assignments
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-textLight hover:text-text bg-background border border-border rounded-lg hover:border-borderHover transition-all"
            onClick={navigateToDetail}
          >
            <ArrowLeft size={16} />
            Back to Request
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primaryHover bg-primaryLight bg-opacity-10 border border-primaryLight rounded-lg hover:bg-opacity-20 transition-all">
            <Mail size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
