import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-lg">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <span className="text-sm text-gray-700">
          Total Records: <span className="font-medium">{totalItems}</span>
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center text-sm px-2 py-2 rounded-md border ${
            currentPage === 1
              ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeftIcon className="h-3 w-4" />
        </button>

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`relative inline-flex items-center text-sm px-3 py-1 rounded-md border ${
                currentPage === pageNum
                  ? "z-10 bg-[#0D9BBF] border-[#0D9BBF] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center text-sm px-2 py-2 rounded-md border ${
            currentPage === totalPages
              ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="sr-only">Next</span>
          <ChevronRightIcon className="h-3 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
