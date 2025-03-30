import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens, getUserId } from "../../utils/authHandler";

// This component handles the export columns selection modal
const ExportColumnsModal = ({ isOpen, onClose, activeFilters }) => {
  const dispatch = useDispatch();
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = getUserId();
  const { jwtToken } = getStoredTokens();

  // All available columns based on paste-5.txt
  const availableColumns = [
    { id: "id", label: "ID" },
    { id: "userFullName", label: "User Full Name" },
    { id: "caseName", label: "Case Name" },
    { id: "subCaseDescription", label: "SubCase Description" },
    { id: "projectName", label: "Project Name" },
    { id: "projectCode", label: "Project Code" },
    { id: "employeeName", label: "Employee Name" },
    { id: "erHyperLinks", label: "ER HyperLinks" },
    { id: "attachments", label: "Attachments" },
    { id: "presentationAttach", label: "Presentation Attach" },
    { id: "explanationAttach", label: "Explanation Attach" },
    { id: "actAttach", label: "Act Attach" },
    { id: "mailToAddresses", label: "Mail To Addresses" },
    { id: "mailCcAddresses", label: "Mail Cc Addresses" },
    { id: "mailBody", label: "Mail Body" },
    { id: "erMember", label: "ER Member" },
    { id: "requestType", label: "Request Type" },
    { id: "status", label: "Status" },
    { id: "disciplinaryAction", label: "Disciplinary Action" },
    { id: "disciplinaryResult", label: "Disciplinary Result" },
    { id: "disciplinaryViolation", label: "Disciplinary Violation" },
    { id: "parentId", label: "Parent ID" },
    { id: "note", label: "Note" },
    { id: "reason", label: "Reason" },
    { id: "isEligible", label: "Is Eligible" },
    { id: "isCanceled", label: "Is Canceled" },
    { id: "contractEndDate", label: "Contract End Date" },
    { id: "orderNumber", label: "Order Number" },
    { id: "createdDate", label: "Created Date" },
    { id: "pendingDate", label: "Pending Date" },
    { id: "underReviewDate", label: "Under Review Date" },
    { id: "decisionMadeDate", label: "Decision Made Date" },
    { id: "reAssignedDate", label: "Re-Assigned Date" },
    { id: "decisionCommunicatedDate", label: "Decision Communicated Date" },
    { id: "completedDate", label: "Completed Date" },
  ];

  const handleColumnToggle = (columnId) => {
    setSelectedColumns((prev) => {
      if (prev.includes(columnId)) {
        return prev.filter((id) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedColumns(availableColumns.map((col) => col.id));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build URL with all filters and selected columns
      const url = new URL(`${API_BASE_URL}/api/ERRequest/export-er-requests`);

      // Add userId
      if (userId) {
        url.searchParams.append("UserId", userId);
      }

      // Add filters
      if (activeFilters.erMember) {
        url.searchParams.append("ERMember", activeFilters.erMember);
      }
      if (activeFilters.projectId) {
        url.searchParams.append("ProjectId", activeFilters.projectId);
      }
      if (activeFilters.employeeId) {
        url.searchParams.append("EmployeeId", activeFilters.employeeId);
      }
      if (activeFilters.caseId) {
        url.searchParams.append("CaseId", activeFilters.caseId);
      }
      if (activeFilters.subCaseId) {
        url.searchParams.append("SubCaseId", activeFilters.subCaseId);
      }
      if (activeFilters.status !== "") {
        url.searchParams.append("ERRequestStatus", activeFilters.status);
      }
      if (
        activeFilters.isCanceled === "true" ||
        activeFilters.isCanceled === "false"
      ) {
        url.searchParams.append("IsCanceled", activeFilters.isCanceled);
      }
      if (activeFilters.startDate) {
        url.searchParams.append("StartedDate", activeFilters.startDate);
      }
      if (activeFilters.endDate) {
        url.searchParams.append("EndDate", activeFilters.endDate);
      }

      // Add export columns if any were selected
      if (selectedColumns.length > 0) {
        selectedColumns.forEach((column) => {
          url.searchParams.append("ExportColumns", column);
        });
      }

      // Fetch the Excel file as a blob
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "narmin",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      // Get the file as a blob
      const blob = await response.blob();

      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger the download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `ER_Requests_Export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-0 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#06b6d4] bg-opacity-10 border-b border-[#06b6d4] border-opacity-30 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#06b6d4] mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">
              Export Columns
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:ring-opacity-50 rounded-full p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 130px)" }}
        >
          <div className="mb-5 bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> Select the columns you
              want to include in the export. If no columns are selected, all
              columns will be exported.
            </p>
          </div>

          <div className="flex justify-between mb-5">
            <span className="text-sm font-medium text-gray-700">
              {selectedColumns.length} of {availableColumns.length} columns
              selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-sm text-white bg-[#06b6d4] rounded hover:bg-[#0B89A9] transition-colors shadow-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5h16M4 12h16m-7 5h7"
                  />
                </svg>
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors shadow-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Deselect All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {availableColumns.map((column) => (
              <div
                key={column.id}
                className={`flex items-center p-2 rounded-md transition-colors ${
                  selectedColumns.includes(column.id)
                    ? "bg-[#06b6d4] bg-opacity-10 border border-[#06b6d4] border-opacity-30"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  id={`column-${column.id}`}
                  checked={selectedColumns.includes(column.id)}
                  onChange={() => handleColumnToggle(column.id)}
                  className="mr-2 h-4 w-4 text-[#06b6d4] focus:ring-[#06b6d4] rounded"
                />
                <label
                  htmlFor={`column-${column.id}`}
                  className={`text-sm cursor-pointer flex-1 ${
                    selectedColumns.includes(column.id)
                      ? "font-medium text-[#06b6d4]"
                      : "text-gray-700"
                  }`}
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={exportToExcel}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#06b6d4] hover:bg-[#0B89A9] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06b6d4] disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Exporting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportColumnsModal;
