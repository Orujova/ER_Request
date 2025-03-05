import React from "react";
import { themeColors } from "../../styles/theme";

const EmptyState = ({
  icon,
  title,
  message,
  buttonText,
  buttonAction,
  searchTerm,
}) => {
  // Render different icon based on prop
  const renderIcon = () => {
    switch (icon) {
      case "search":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: `${themeColors.textLight}60` }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "folder":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: `${themeColors.textLight}60` }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        );
      case "document":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: `${themeColors.textLight}60` }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: `${themeColors.textLight}60` }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-lg"
      style={{
        backgroundColor: themeColors.background,
        boxShadow: themeColors.cardShadow,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {renderIcon()}
      <h3
        className="text-lg font-medium mb-2"
        style={{ color: themeColors.text }}
      >
        {title}
      </h3>
      <p
        className="text-center mb-4 max-w-md px-4"
        style={{ color: themeColors.textLight }}
      >
        {message}
      </p>
      <button
        onClick={buttonAction}
        className="px-4 py-2 rounded-md transition-colors duration-150"
        style={
          searchTerm
            ? {
                backgroundColor: `${themeColors.primary}10`,
                color: themeColors.primary,
              }
            : {
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 4px ${themeColors.primaryDark}40`,
              }
        }
        onMouseOver={(e) => {
          if (searchTerm) {
            e.currentTarget.style.backgroundColor = `${themeColors.primary}20`;
          } else {
            e.currentTarget.style.boxShadow = `0 3px 6px ${themeColors.primaryDark}60`;
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseOut={(e) => {
          if (searchTerm) {
            e.currentTarget.style.backgroundColor = `${themeColors.primary}10`;
          } else {
            e.currentTarget.style.boxShadow = `0 2px 4px ${themeColors.primaryDark}40`;
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState;
