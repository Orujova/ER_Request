// AttachmentManager.jsx
import React from "react";
import {
  Paperclip,
  Link2,
  Trash2,
  File,
  FileText,
  FileChartPie,
  FileSpreadsheet,
  Image,
  ExternalLink,
  Globe,
} from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

// File type icon selector helper
const getFileIcon = (url) => {
  const extension = url.split(".").pop().toLowerCase();

  switch (extension) {
    case "pdf":
      return <FileText className="w-4 h-4 text-rose-500" />;
    case "doc":
    case "docx":
      return <FileText className="w-4 h-4 text-sky-500" />;
    case "xls":
    case "xlsx":
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    case "ppt":
    case "pptx":
      return <FileChartPie className="w-4 h-4 text-amber-500" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <Image className="w-4 h-4 text-purple-500" />;
    default:
      return <File className="w-4 h-4 text-slate-500" />;
  }
};

// Format the attachment name from URL
const formatAttachmentName = (url) => {
  try {
    const filename = url.split("/").pop();
    return decodeURIComponent(filename);
  } catch (e) {
    return url;
  }
};

// Attachment card component to display a group of attachments
const AttachmentCard = ({
  title,
  attachments,
  type,
  onDelete,
  emptyMessage,
  icon,
}) => {
  const isEmpty = !attachments || attachments.length === 0;

  if (isEmpty) return null;

  return (
    <div className="border border-slate-200 rounded-md mb-4">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          {icon || <Paperclip className="w-4 h-4 text-sky-600" />}
          {title} ({attachments?.length || 0})
        </h3>
      </div>
      <div className="p-4">
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
                  <span className="truncate">{formatAttachmentName(url)}</span>
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
      </div>
    </div>
  );
};

// Hyperlink card component to display hyperlinks
const HyperlinkCard = ({ hyperLinks, onDelete }) => {
  const isEmpty = !hyperLinks || hyperLinks.length === 0;

  if (isEmpty) return null;

  return (
    <div className="border border-slate-200 rounded-md mb-4">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-sky-600" />
          Hyperlinks ({hyperLinks?.length || 0})
        </h3>
      </div>
      <div className="p-4">
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
                <Globe className="w-4 h-4 text-slate-500" />
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
      </div>
    </div>
  );
};

// Empty state when no attachments or links
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-10 px-6 bg-slate-50 rounded-md border border-slate-200 text-center mb-4">
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
  </div>
);

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
  // Handler for deleting attachments
  const handleDeleteAttachment = async (url, type) => {
    try {
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
      formData.append("AttachmentPathsToDelete", url);

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
        throw new Error(`Error deleting attachment: ${response.status}`);
      }

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error deleting attachment:", err);
    }
  };

  // Handler for deleting hyperlinks
  const handleDeleteHyperlink = async (linkId) => {
    try {
      const { token } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
      formData.append("HyperLinkIdsToDelete", linkId);

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
        throw new Error(`Error deleting hyperlink: ${response.status}`);
      }

      // Callback to refresh attachments
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error("Error deleting hyperlink:", err);
    }
  };

  // Check if there are any attachments or links
  const hasAnyContent =
    presentationAttachments.length > 0 ||
    actAttachments.length > 0 ||
    explanationAttachments.length > 0 ||
    generalAttachments.length > 0 ||
    hyperLinks.length > 0;

  // Show empty state if no content
  if (!hasAnyContent) {
    return <EmptyState />;
  }

  // List of attachment groups
  const attachmentGroups = [
    {
      title: "Presentation Attachments",
      attachments: presentationAttachments,
      type: "presentation",
      icon: <FileChartPie className="w-4 h-4 text-amber-500" />,
    },
    {
      title: "Act Attachments",
      attachments: actAttachments,
      type: "act",
      icon: <FileText className="w-4 h-4 text-sky-500" />,
    },
    {
      title: "Explanation Attachments",
      attachments: explanationAttachments,
      type: "explanation",
      icon: <FileText className="w-4 h-4 text-rose-500" />,
    },
    {
      title: "General Attachments",
      attachments: generalAttachments,
      type: "general",
      icon: <Paperclip className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <div>
      {/* Render attachment cards */}
      {attachmentGroups.map((group, index) => (
        <AttachmentCard
          key={`${group.type}-${index}`}
          title={group.title}
          attachments={group.attachments}
          type={group.type}
          onDelete={handleDeleteAttachment}
          icon={group.icon}
        />
      ))}

      {/* Render hyperlink card */}
      <HyperlinkCard hyperLinks={hyperLinks} onDelete={handleDeleteHyperlink} />
    </div>
  );
};

export default AttachmentManager;
