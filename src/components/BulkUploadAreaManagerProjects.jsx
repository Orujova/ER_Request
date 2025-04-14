import React, { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";
import Alert from "../components/common/Alert";
import { showToast } from "../toast/toast";
// Public template file download
const downloadPublicTemplate = async () => {
  try {
    // Construct the full URL to the public template
    const templateUrl = "/templates/Bulk_upload";

    // Fetch the file
    const response = await fetch(templateUrl);

    if (!response.ok) {
      throw new Error("Failed to download template");
    }

    // Convert response to blob
    const blob = await response.blob();

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "Bulk_upload.xlsx";
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Template download error:", error);
    alert("Could not download template. Please try again.");
  }
};

const BulkUploadAreaManagerProjects = ({
  onSuccessfulUpload,
  projects,
  employees,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const { jwtToken } = getStoredTokens();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Employee/areamanagerprojectimportexceldata`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload file");
      }

      showToast("Area manager projects imported successfully", "success");
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call the callback to refresh data if provided
      if (onSuccessfulUpload) {
        onSuccessfulUpload();
      }

      // Auto-dismiss success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to upload file");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadPublicTemplate();
  };

  return (
    <div className="mt-6 bg-gray-50 p-5 rounded-md">
      <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      <Alert
        variant="success"
        message={success}
        onDismiss={() => setSuccess(null)}
      />

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-gray-700 font-medium
            bg-white border border-gray-300 hover:bg-gray-100 focus:ring-1 focus:ring-gray-300 
            transition-colors"
        >
          <FileSpreadsheet size={18} className="text-cyan-600" />
          Download Template
        </button>

        {/* File Upload Button */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            className="hidden"
            id="bulk-upload-input"
          />
          <label
            htmlFor="bulk-upload-input"
            className="flex items-center gap-2 px-4 py-2.5 rounded-md text-white font-medium
              bg-cyan-600 hover:bg-cyan-700 focus:ring-1 focus:ring-cyan-500 focus:ring-offset-2
              transition-colors cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Upload size={18} />
            )}
            Bulk Upload
          </label>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadAreaManagerProjects;
