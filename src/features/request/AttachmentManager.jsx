import React, { useState } from "react";
import {
  Paperclip,
  Link2,
  Trash2,
  File,
  ExternalLink,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

// AttachmentTypeSelector component for selecting attachment type
const AttachmentTypeSelector = ({ value, onChange }) => {
  const options = [
    { value: "presentation", label: "Presentation" },
    { value: "act", label: "Act" },
    { value: "explanation", label: "Explanation" },
    { value: "general", label: "General" },
  ];

  return (
    <select
      className="flex-shrink-0 bg-white border border-slate-300 rounded-md text-sm px-3 py-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Error message component
const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-md text-sm flex items-center justify-between">
      <div className="flex items-center">
        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-500 hover:text-rose-700 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Success message component
const SuccessMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-md text-sm flex items-center">
      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

// Attachment card component to display a group of attachments
const AttachmentCard = ({
  title,
  attachments,
  type,
  onDelete,
  emptyMessage,
}) => {
  const isEmpty = !attachments || attachments.length === 0;

  const getFileIcon = (url) => {
    const extension = url.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return <File className="w-4 h-4 text-rose-500" />;
      case "doc":
      case "docx":
        return <File className="w-4 h-4 text-sky-500" />;
      case "xls":
      case "xlsx":
        return <File className="w-4 h-4 text-emerald-500" />;
      case "ppt":
      case "pptx":
        return <File className="w-4 h-4 text-amber-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <File className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatAttachmentName = (url) => {
    try {
      const filename = url.split("/").pop();
      return decodeURIComponent(filename);
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-sky-600" />
          {title} ({attachments?.length || 0})
        </h3>
      </div>
      <div className="p-4">
        {!isEmpty ? (
          <ul className="divide-y divide-slate-200">
            {attachments.map((url, index) => {
              // Convert erReq paths to erfile paths for download
              const downloadUrl = url.replace("erReq", "erfile");

              return (
                <li
                  key={`${type}-${index}`}
                  className="py-3 flex items-center justify-between group"
                >
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-sky-600 hover:underline group flex-1 truncate"
                  >
                    {getFileIcon(url)}
                    <span className="truncate">
                      {formatAttachmentName(url)}
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(url, type)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-2"
                    title="Delete attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <Paperclip className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>{emptyMessage || "No attachments in this category"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Hyperlink card component to display hyperlinks
const HyperlinkCard = ({ hyperLinks, onDelete }) => {
  const isEmpty = !hyperLinks || hyperLinks.length === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-sky-600" />
          Hyperlinks ({hyperLinks?.length || 0})
        </h3>
      </div>
      <div className="p-4">
        {!isEmpty ? (
          <ul className="divide-y divide-slate-200">
            {hyperLinks.map((link, index) => (
              <li
                key={`link-${index}`}
                className="py-3 flex items-center justify-between group"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-700 hover:text-sky-600 hover:underline group flex-1 truncate"
                >
                  <Link2 className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{link.url}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <button
                  type="button"
                  onClick={() => onDelete(link.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors ml-2"
                  title="Delete hyperlink"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <Link2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>No hyperlinks added</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main AttachmentManager component
const AttachmentManager = ({
  requestId,
  presentationAttachments = [],
  actAttachments = [],
  explanationAttachments = [],
  generalAttachments = [],
  hyperLinks = [],
  onAttachmentsUpdated,
}) => {
  const [uploadType, setUploadType] = useState("general");
  const [newLink, setNewLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const groupedAttachments = [
    {
      title: "Presentation Attachments",
      attachments: presentationAttachments,
      type: "presentation",
      emptyMessage: "No presentation attachments",
    },
    {
      title: "Act Attachments",
      attachments: actAttachments,
      type: "act",
      emptyMessage: "No act documents attached",
    },
    {
      title: "Explanation Attachments",
      attachments: explanationAttachments,
      type: "explanation",
      emptyMessage: "No explanation attachments",
    },
    {
      title: "General Attachments",
      attachments: generalAttachments,
      type: "general",
      emptyMessage: "No general attachments",
    },
  ];

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
      setErrorMessage("");
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage("");
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
      const fileInput = document.getElementById("fileUpload");
      if (fileInput) {
        fileInput.value = "";
      }

      // Show success message
      setSuccessMessage(
        `File uploaded successfully as ${uploadType} attachment`
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      setErrorMessage(err.message);
      console.error("Error uploading file:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddHyperlink = async () => {
    if (!newLink || !newLink.trim()) {
      setErrorMessage("Please enter a valid URL");
      return;
    }

    if (!newLink.startsWith("http://") && !newLink.startsWith("https://")) {
      setErrorMessage("URL must start with http:// or https://");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage("");
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
      formData.append("HyperLinksToAdd", newLink);

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
        throw new Error(`Error adding hyperlink: ${response.status}`);
      }

      // Clear the input
      setNewLink("");

      // Show success message
      setSuccessMessage("Hyperlink added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      setErrorMessage(err.message);
      console.error("Error adding hyperlink:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (url, type) => {
    try {
      setErrorMessage("");
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
      formData.append("AttachmentPathsToDelete", url);

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
        throw new Error(`Error deleting attachment: ${response.status}`);
      }

      // Show success message
      setSuccessMessage("Attachment deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      setErrorMessage(err.message);
      console.error("Error deleting attachment:", err);
    }
  };

  const handleDeleteHyperlink = async (linkId) => {
    try {
      setErrorMessage("");
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
      formData.append("HyperLinkIdsToDelete", linkId);

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
        throw new Error(`Error deleting hyperlink: ${response.status}`);
      }

      // Show success message
      setSuccessMessage("Hyperlink deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      setErrorMessage(err.message);
      console.error("Error deleting hyperlink:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-medium text-slate-900">Add Attachment or Link</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {errorMessage && (
              <ErrorMessage
                message={errorMessage}
                onDismiss={() => setErrorMessage("")}
              />
            )}

            {successMessage && <SuccessMessage message={successMessage} />}

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Upload File
              </label>
              <div className="flex items-center gap-2">
                <AttachmentTypeSelector
                  value={uploadType}
                  onChange={setUploadType}
                />
                <input
                  type="file"
                  id="fileUpload"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 focus:outline-none"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
              onClick={handleFileUpload}
              disabled={isUploading || !fileToUpload}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <div className="border-t border-slate-200 my-4"></div>

          {/* Hyperlink Add */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Add Hyperlink
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="block w-full rounded-md border-slate-300 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50 text-sm"
                placeholder="https://example.com"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
                onClick={handleAddHyperlink}
                disabled={isUploading || !newLink}
              >
                <Link2 className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupedAttachments.map((group, groupIndex) => (
          <AttachmentCard
            key={`group-${groupIndex}`}
            title={group.title}
            attachments={group.attachments}
            type={group.type}
            onDelete={handleDeleteAttachment}
            emptyMessage={group.emptyMessage}
          />
        ))}

        {/* Hyperlinks Display */}
        <HyperlinkCard
          hyperLinks={hyperLinks}
          onDelete={handleDeleteHyperlink}
        />
      </div>
    </div>
  );
};

export default AttachmentManager;
