// AttachmentsTab.jsx
import React, { useState, useRef } from "react";
import { Paperclip, ArrowUpToLine, Link2 } from "lucide-react";
import AttachmentManager from "./AttachmentManager";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

const AttachmentsTab = ({
  requestId,
  presentationAttachments = [],
  actAttachments = [],
  explanationAttachments = [],
  generalAttachments = [],
  hyperLinks = [],
  onAttachmentsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [activeUploadTab, setActiveUploadTab] = useState("upload");
  const [uploadType, setUploadType] = useState("general");
  const [newLink, setNewLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const fileInputRef = useRef(null);

  // Calculate totals
  const totalFiles =
    presentationAttachments.length +
    actAttachments.length +
    explanationAttachments.length +
    generalAttachments.length;
  const totalLinks = hyperLinks.length;

  // Filter attachments based on active tab
  const getFilteredAttachments = () => {
    if (activeTab === "all") {
      return {
        presentationAttachments,
        actAttachments,
        explanationAttachments,
        generalAttachments,
        hyperLinks,
      };
    } else if (activeTab === "presentation") {
      return {
        presentationAttachments,
        actAttachments: [],
        explanationAttachments: [],
        generalAttachments: [],
        hyperLinks: [],
      };
    } else if (activeTab === "act") {
      return {
        presentationAttachments: [],
        actAttachments,
        explanationAttachments: [],
        generalAttachments: [],
        hyperLinks: [],
      };
    } else if (activeTab === "explanation") {
      return {
        presentationAttachments: [],
        actAttachments: [],
        explanationAttachments,
        generalAttachments: [],
        hyperLinks: [],
      };
    } else if (activeTab === "general") {
      return {
        presentationAttachments: [],
        actAttachments: [],
        explanationAttachments: [],
        generalAttachments,
        hyperLinks: [],
      };
    } else if (activeTab === "links") {
      return {
        presentationAttachments: [],
        actAttachments: [],
        explanationAttachments: [],
        generalAttachments: [],
        hyperLinks,
      };
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  // Handle file upload button click
  const handleFileUpload = async () => {
    if (!fileToUpload) return;

    try {
      setIsUploading(true);
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);

      if (uploadType === "presentation") {
        formData.append("PresentationAttachments", fileToUpload);
      } else if (uploadType === "act") {
        formData.append("ActAttachments", fileToUpload);
      } else if (uploadType === "explanation") {
        formData.append("ExplanationAttachments", fileToUpload);
      } else {
        formData.append("GeneralAttachments", fileToUpload);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/ManageERRequestAttachmentsAndHyperLinks`,
        {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "narmin",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error uploading file: ${response.status}`);
      }

      // Clear the file input
      setFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle adding hyperlink
  const handleAddHyperlink = async () => {
    if (!newLink || !newLink.trim()) return;

    try {
      setIsUploading(true);
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
      formData.append("HyperLinksToAdd", newLink);

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/ManageERRequestAttachmentsAndHyperLinks`,
        {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "narmin",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error adding hyperlink: ${response.status}`);
      }

      // Clear the input
      setNewLink("");

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error adding hyperlink:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file selection when clicking on drop area
  const handleDropAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Attachments & Links
          </h2>
          <p className="text-sm text-slate-500">
            {totalFiles} files · {totalLinks} links
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-slate-200 mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm ${
            activeTab === "all"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveTab("presentation")}
          className={`px-4 py-2 text-sm ${
            activeTab === "presentation"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600"
          }`}
        >
          Presentations
          {presentationAttachments.length > 0 && (
            <span className="ml-1 px-1 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {presentationAttachments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("act")}
          className={`px-4 py-2 text-sm ${
            activeTab === "act"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600"
          }`}
        >
          Act Documents
          {actAttachments.length > 0 && (
            <span className="ml-1 px-1 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {actAttachments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("explanation")}
          className={`px-4 py-2 text-sm ${
            activeTab === "explanation"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600"
          }`}
        >
          Explanations
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-sm ${
            activeTab === "general"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600"
          }`}
        >
          General Files
        </button>

        <button
          onClick={() => setActiveTab("links")}
          className={`px-4 py-2 text-sm ${
            activeTab === "links"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-slate-600"
          }`}
        >
          Links
          {hyperLinks.length > 0 && (
            <span className="ml-1 px-1 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
              {hyperLinks.length}
            </span>
          )}
        </button>
      </div>

      {/* Add New button */}
      <button
        onClick={() => setShowUploadSection(!showUploadSection)}
        className="text-sky-600 text-sm border border-slate-200 rounded-md px-4 py-2 mb-4"
      >
        + Add New
      </button>

      {/* Upload/Link Panel - Toggleable */}
      {showUploadSection && (
        <div className="border border-slate-200 rounded-md mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveUploadTab("upload")}
              className={`px-4 py-2 text-sm ${
                activeUploadTab === "upload"
                  ? "text-sky-600 border-b-2 border-sky-500"
                  : "text-slate-600"
              } flex items-center gap-1`}
            >
              <ArrowUpToLine className="w-4 h-4" />
              Upload File
            </button>

            <button
              onClick={() => setActiveUploadTab("link")}
              className={`px-4 py-2 text-sm ${
                activeUploadTab === "link"
                  ? "text-sky-600 border-b-2 border-sky-500"
                  : "text-slate-600"
              } flex items-center gap-1`}
            >
              <Link2 className="w-4 h-4" />
              Add Link
            </button>
          </div>

          <div className="p-4">
            {/* File Upload Form */}
            {activeUploadTab === "upload" && (
              <div>
                <div className="mb-4">
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="border border-slate-300 rounded-md py-2 px-3 text-sm mb-4 w-full sm:w-auto"
                  >
                    <option value="general">General</option>
                    <option value="act">Act</option>
                    <option value="presentation">Presentation</option>
                    <option value="explanation">Explanation</option>
                  </select>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  className="border-2 border-dashed border-slate-200 rounded-md p-8 text-center mb-4 cursor-pointer"
                  onClick={handleDropAreaClick}
                >
                  <div className="flex flex-col items-center text-slate-400">
                    <ArrowUpToLine className="w-6 h-6 mb-2" />
                    <p className="text-sm">
                      {fileToUpload
                        ? fileToUpload.name
                        : "Click to select a file or drag and drop"}
                    </p>
                    <p className="text-xs mt-1 text-slate-300">
                      PDF, Word, Excel, PowerPoint, images and other document
                      types
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleFileUpload}
                  disabled={!fileToUpload || isUploading}
                  className="bg-sky-500 text-white px-5 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}

            {/* Add Link Form */}
            {activeUploadTab === "link" && (
              <div>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="border border-slate-300 rounded-md w-full mb-4 p-2 text-sm"
                />

                <button
                  onClick={handleAddHyperlink}
                  disabled={!newLink || isUploading}
                  className="bg-sky-500 text-white px-5 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {isUploading ? "Adding..." : "Add Link"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Use AttachmentManager to display the attachments */}
      <AttachmentManager
        requestId={requestId}
        presentationAttachments={
          getFilteredAttachments().presentationAttachments
        }
        actAttachments={getFilteredAttachments().actAttachments}
        explanationAttachments={getFilteredAttachments().explanationAttachments}
        generalAttachments={getFilteredAttachments().generalAttachments}
        hyperLinks={getFilteredAttachments().hyperLinks}
        onAttachmentsUpdated={onAttachmentsUpdated}
      />
    </div>
  );
};

export default AttachmentsTab;
