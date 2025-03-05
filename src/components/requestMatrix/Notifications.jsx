import React from "react";
import { themeColors } from "../../styles/theme";

const Notifications = ({ error, success, setError }) => {
  return (
    <>
      {error && (
        <div
          className="mb-6 p-4 rounded shadow-md border-l-4"
          style={{
            backgroundColor: `${themeColors.error}10`,
            borderLeftColor: themeColors.error,
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style={{ color: themeColors.error }}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p
                className="text-sm font-medium"
                style={{ color: themeColors.text }}
              >
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 focus:outline-none"
                  style={{
                    color: themeColors.error,
                    backgroundColor: `${themeColors.error}20`,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColors.error}30`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColors.error}20`;
                  }}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div
          className="mb-6 p-4 rounded shadow-md border-l-4"
          style={{
            backgroundColor: `${themeColors.success}10`,
            borderLeftColor: themeColors.success,
          }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style={{ color: themeColors.success }}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p
                className="text-sm font-medium"
                style={{ color: themeColors.text }}
              >
                {success}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
