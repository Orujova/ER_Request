// src/components/RequestForm/SubmitButton.js
import React from "react";

const SubmitButton = ({ isLoading, isValid, onReset }) => {
  return (
    <div className="flex space-x-4">
      <button
        type="submit"
        disabled={isLoading || !isValid}
        className={`flex-grow py-4 px-6 text-white text-lg font-semibold rounded-xl shadow-md transition-colors ${
          isLoading || !isValid
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-sky-600 hover:bg-sky-700"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Submitting...
          </div>
        ) : (
          "Submit Request"
        )}
      </button>

      <button
        type="button"
        onClick={onReset}
        className="py-4 px-6 text-gray-600 text-lg font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};

export default SubmitButton;
