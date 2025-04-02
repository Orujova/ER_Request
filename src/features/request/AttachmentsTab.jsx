// AttachmentsTab.jsx - Restructured
import React, { useState, useRef } from "react";
import { Paperclip, ArrowUpToLine, Link2, X } from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";
import FileAttachmentManager from "./AttachmentManager";

const AttachmentsTab = ({
  requestId,
  presentationAttachments = [],
  actAttachments = [],
  explanationAttachments = [],
  generalAttachments = [],
  hyperLinks = [],
  onAttachmentsUpdated,
}) => {
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [uploadType, setUploadType] = useState("general");
  const [activeUploadMode, setActiveUploadMode] = useState("file");
  const [newLink, setNewLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Single view tab controller
  const [activeViewTab, setActiveViewTab] = useState("all");

  // Calculate totals for display
  const totalFiles =
    presentationAttachments.length +
    actAttachments.length +
    explanationAttachments.length +
    generalAttachments.length;
  const totalLinks = hyperLinks.length;

  // Get filtered attachments based on active tab
  const getFilteredAttachments = () => {
    switch (activeViewTab) {
      case "presentation":
        return {
          presentationAttachments,
          actAttachments: [],
          explanationAttachments: [],
          generalAttachments: [],
          hyperLinks: [],
        };
      case "act":
        return {
          presentationAttachments: [],
          actAttachments,
          explanationAttachments: [],
          generalAttachments: [],
          hyperLinks: [],
        };
      case "explanation":
        return {
          presentationAttachments: [],
          actAttachments: [],
          explanationAttachments,
          generalAttachments: [],
          hyperLinks: [],
        };
      case "general":
        return {
          presentationAttachments: [],
          actAttachments: [],
          explanationAttachments: [],
          generalAttachments,
          hyperLinks: [],
        };
      case "links":
        return {
          presentationAttachments: [],
          actAttachments: [],
          explanationAttachments: [],
          generalAttachments: [],
          hyperLinks,
        };
      case "all":
      default:
        return {
          presentationAttachments,
          actAttachments,
          explanationAttachments,
          generalAttachments,
          hyperLinks,
        };
    }
  };

  // Handler for file selection
  const handleFileChange = (e) => {
    setErrorMessage("");
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Add file size validation (example: 10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size exceeds 10MB limit");
        return;
      }
      setFileToUpload(file);
    }
  };

  // Handle file upload with improved error handling
  const handleFileUpload = async () => {
    if (!fileToUpload) return;

    try {
      setIsProcessing(true);
      setErrorMessage("");
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);

      // Map upload type to the correct form field
      const uploadTypeMap = {
        presentation: "PresentationAttachments",
        act: "ActAttachments",
        explanation: "ExplanationAttachments",
        general: "GeneralAttachments",
      };

      formData.append(
        uploadTypeMap[uploadType] || "GeneralAttachments",
        fileToUpload
      );

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/ManageERRequestAttachmentsAndHyperLinks`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error uploading file: ${errorText || response.status}`
        );
      }

      // Reset file upload state
      setFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Close the upload panel after successful upload
      setIsUploadPanelOpen(false);

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setErrorMessage(err.message || "Failed to upload file");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle hyperlink addition with validation
  const handleAddHyperlink = async () => {
    if (!newLink || !newLink.trim()) return;

    // Basic URL validation
    if (!newLink.match(/^https?:\/\/.+/i)) {
      setErrorMessage(
        "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");
      const { jwtToken } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
      formData.append("HyperLinksToAdd", newLink);

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/ManageERRequestAttachmentsAndHyperLinks`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error adding hyperlink: ${errorText || response.status}`
        );
      }

      // Reset link state
      setNewLink("");

      // Close the upload panel after successful addition
      setIsUploadPanelOpen(false);

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error adding hyperlink:", err);
      setErrorMessage(err.message || "Failed to add link");
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger file selection when clicking on drop area
  const handleDropAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Delete attachment handler - will be passed to FileAttachmentManager
  const handleDeleteAttachment = async (url, type) => {
    if (!url || !type) return;

    try {
      setIsProcessing(true);
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);

      // Map attachment type to the correct form field for deletion
      const attachmentTypeMap = {
        presentation: "PresentationAttachments",
        act: "ActAttachments",
        explanation: "ExplanationAttachments",
        general: "GeneralAttachments",
      };

      const attachmentField = attachmentTypeMap[type];
      if (!attachmentField) {
        throw new Error("Invalid attachment type");
      }

      formData.append(attachmentField, url);

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/ManageERRequestAttachmentsAndHyperLinks`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error deleting attachment: ${errorText || response.status}`
        );
      }

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error deleting attachment:", err);
      setErrorMessage(err.message || "Failed to delete attachment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete hyperlink handler - will be passed to FileAttachmentManager
  const handleDeleteHyperlink = async (link) => {
    if (!link) return;

    try {
      setIsProcessing(true);
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);

      // Handle both object and string hyperlinks
      const linkId = typeof link === "object" ? link.id : link;

      formData.append("HyperLinkIdsToDelete", linkId);

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/ManageERRequestAttachmentsAndHyperLinks`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error deleting hyperlink: ${errorText || response.status}`
        );
      }

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error deleting hyperlink:", err);
      setErrorMessage(err.message || "Failed to delete link");
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine if we have any content to display
  const hasAnyContent = totalFiles > 0 || totalLinks > 0;

  return (
    <div className="attachments-tab">
      {/* Header with summary count */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Attachments & Links
          </h2>
          <p className="text-sm text-slate-500">
            {totalFiles} files · {totalLinks} links
          </p>
        </div>
        {/* Single centralized upload button */}
        <button
          onClick={() => setIsUploadPanelOpen(!isUploadPanelOpen)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-colors"
        >
          {isUploadPanelOpen ? (
            <>
              <X className="w-4 h-4" /> Close
            </>
          ) : (
            <>
              <Paperclip className="w-4 h-4" /> Add File/Link
            </>
          )}
        </button>
      </div>

      {/* Upload/Link Panel - Centralized */}
      {isUploadPanelOpen && (
        <div className="border border-slate-200 rounded-md mb-6 bg-white shadow-sm">
          {/* Upload Type Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveUploadMode("file")}
              className={`px-4 py-2 text-sm flex items-center gap-1 ${
                activeUploadMode === "file"
                  ? "text-sky-600 border-b-2 border-sky-500"
                  : "text-slate-600"
              }`}
            >
              <ArrowUpToLine className="w-4 h-4" />
              Upload File
            </button>

            <button
              onClick={() => setActiveUploadMode("link")}
              className={`px-4 py-2 text-sm flex items-center gap-1 ${
                activeUploadMode === "link"
                  ? "text-sky-600 border-b-2 border-sky-500"
                  : "text-slate-600"
              }`}
            >
              <Link2 className="w-4 h-4" />
              Add Link
            </button>
          </div>

          <div className="p-4">
            {/* File Upload Form */}
            {activeUploadMode === "file" && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-700 mb-1">
                    Attachment Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="border border-slate-300 rounded-md py-2 px-3 text-sm w-full focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="general">General Document</option>
                    <option value="act">Act Document</option>
                    <option value="presentation">Presentation</option>
                    <option value="explanation">Explanation Document</option>
                  </select>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  className={`border-2 border-dashed ${
                    fileToUpload
                      ? "border-sky-200 bg-sky-50"
                      : "border-slate-200"
                  } rounded-md p-8 text-center mb-4 cursor-pointer hover:bg-slate-50 transition-colors`}
                  onClick={handleDropAreaClick}
                >
                  <div className="flex flex-col items-center text-slate-400">
                    <ArrowUpToLine className="w-6 h-6 mb-2 text-sky-500" />
                    {fileToUpload ? (
                      <div className="text-sky-700 font-medium">
                        {fileToUpload.name}
                        <p className="text-xs mt-1 text-sky-500">
                          {(fileToUpload.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">
                          Click to select a file or drag and drop
                        </p>
                        <p className="text-xs mt-1 text-slate-300">
                          PDF, Word, Excel, PowerPoint, images and other
                          document types
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 text-rose-600 p-2 rounded-md mb-4 text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleFileUpload}
                    disabled={!fileToUpload || isProcessing}
                    className="bg-sky-500 text-white px-5 py-2 rounded-md text-sm disabled:opacity-50 hover:bg-sky-600 transition-colors"
                  >
                    {isProcessing ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              </div>
            )}

            {/* Add Link Form */}
            {activeUploadMode === "link" && (
              <div>
                <label className="block text-sm text-slate-700 mb-1">URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="border border-slate-300 rounded-md w-full mb-4 p-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />

                {errorMessage && (
                  <div className="bg-rose-50 text-rose-600 p-2 rounded-md mb-4 text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleAddHyperlink}
                    disabled={!newLink || isProcessing}
                    className="bg-sky-500 text-white px-5 py-2 rounded-md text-sm disabled:opacity-50 hover:bg-sky-600 transition-colors"
                  >
                    {isProcessing ? "Adding..." : "Add Link"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View filter tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        <button
          onClick={() => setActiveViewTab("all")}
          className={`px-4 py-2 text-sm ${
            activeViewTab === "all"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveViewTab("presentation")}
          className={`px-4 py-2 text-sm ${
            activeViewTab === "presentation"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Presentations
          {presentationAttachments.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {presentationAttachments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveViewTab("act")}
          className={`px-4 py-2 text-sm ${
            activeViewTab === "act"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Act Documents
          {actAttachments.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {actAttachments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveViewTab("explanation")}
          className={`px-4 py-2 text-sm ${
            activeViewTab === "explanation"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Explanations
          {explanationAttachments.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {explanationAttachments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveViewTab("general")}
          className={`px-4 py-2 text-sm ${
            activeViewTab === "general"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          General Files
          {generalAttachments.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {generalAttachments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveViewTab("links")}
          className={`px-4 py-2 text-sm ${
            activeViewTab === "links"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Links
          {hyperLinks.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {hyperLinks.length}
            </span>
          )}
        </button>
      </div>

      {/* Display attachments with FileAttachmentManager */}
      {!hasAnyContent ? (
        <EmptyState onAddNew={() => setIsUploadPanelOpen(true)} />
      ) : (
        <FileAttachmentManager
          requestId={requestId}
          presentationAttachments={
            getFilteredAttachments().presentationAttachments
          }
          actAttachments={getFilteredAttachments().actAttachments}
          explanationAttachments={
            getFilteredAttachments().explanationAttachments
          }
          generalAttachments={getFilteredAttachments().generalAttachments}
          hyperLinks={getFilteredAttachments().hyperLinks}
          onDeleteAttachment={handleDeleteAttachment}
          onDeleteHyperlink={handleDeleteHyperlink}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

// Empty state component
const EmptyState = ({ onAddNew }) => (
  <div className="flex flex-col items-center justify-center py-10 px-6 bg-slate-50 rounded-md border border-slate-200 text-center">
    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
      <Paperclip className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 mb-2">
      No attachments or links yet
    </h3>
    <p className="text-slate-500 max-w-md mb-6">
      Upload files or add links to share important documents and resources with
      this request.
    </p>
    <button
      onClick={onAddNew}
      className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
    >
      Add File or Link
    </button>
  </div>
);

export default AttachmentsTab;
