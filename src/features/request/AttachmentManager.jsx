import React, { useState } from "react";
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
  AlertCircle,
} from "lucide-react";

// File type icon selector helper
const getFileIcon = (attachment) => {
  const extension = attachment.url.split(".").pop().toLowerCase();

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
const formatAttachmentName = (attachment) => {
  try {
    const url = typeof attachment === "object" ? attachment.url : attachment;
    const filename = url.split("/").pop();
    return decodeURIComponent(filename);
  } catch (e) {
    return typeof attachment === "object" ? attachment.url : attachment;
  }
};

// Attachment Card component to display a group of attachments
const AttachmentCardGroup = ({
  title,
  attachments = [],
  type,
  onDeleteAttachment,
  icon,
  isProcessing,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  // Handle delete confirmation
  const handleConfirmDelete = (attachmentId) => {
    if (confirmDelete === attachmentId && !isProcessing) {
      onDeleteAttachment({ id: attachmentId });
      setConfirmDelete(null);
    } else {
      setConfirmDelete(attachmentId);
    }
  };

  return (
    <div className="border border-slate-200 rounded-md mb-4 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          {icon || <Paperclip className="w-4 h-4 text-sky-600" />}
          {title} ({attachments.length})
        </h3>
      </div>

      <div className="p-4">
        <ul className="divide-y divide-slate-200">
          {attachments.map((attachment, index) => {
            // Convert erReq paths to erfile paths for download
            const downloadUrl = attachment.url.replace("erfile", "uploads/erfile");
            const isDeleting = confirmDelete === attachment.id;

            return (
              <li
                key={`${type}-${attachment.id || index}`}
                className="py-3 flex items-center justify-between group"
              >
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-700 hover:text-sky-600 hover:underline group flex-1 truncate"
                >
                  {getFileIcon(attachment)}
                  <span className="truncate">{formatAttachmentName(attachment)}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(attachment.id)}
                  disabled={isProcessing || !attachment.id}
                  className={`text-slate-400 hover:text-rose-600 transition-colors ml-2 p-1 rounded-full
                    ${isDeleting ? "bg-rose-50 text-rose-600" : ""}
                    ${isProcessing || !attachment.id ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  title={
                    isDeleting
                      ? "Click again to confirm deletion"
                      : "Delete attachment"
                  }
                >
                  {isDeleting ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

// Hyperlink Card component to display hyperlinks
const HyperlinkCardGroup = ({
  hyperLinks = [],
  onDeleteHyperlink,
  isProcessing,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Skip rendering if no hyperlinks
  if (!hyperLinks || hyperLinks.length === 0) return null;

  // Normalize hyperLinks to handle both string and object formats
  const normalizedHyperLinks = hyperLinks.map((link) =>
    typeof link === "object" ? link : { id: link, url: link }
  );

  // Handle delete confirmation
  const handleConfirmDelete = (linkId) => {
    if (confirmDelete === linkId && !isProcessing) {
      onDeleteHyperlink(linkId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(linkId);
    }
  };

  return (
    <div className="border border-slate-200 rounded-md mb-4 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-medium text-slate-900 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-sky-600" />
          Hyperlinks ({normalizedHyperLinks.length})
        </h3>
      </div>

      <div className="p-4">
        <ul className="divide-y divide-slate-200">
          {normalizedHyperLinks.map((link, index) => {
            const isDeleting = confirmDelete === link.id;

            return (
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
                  onClick={() => handleConfirmDelete(link.id)}
                  disabled={isProcessing}
                  className={`text-slate-400 hover:text-rose-600 transition-colors ml-2 p-1 rounded-full
                    ${isDeleting ? "bg-rose-50 text-rose-600" : ""}
                    ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  title={
                    isDeleting
                      ? "Click again to confirm deletion"
                      : "Delete hyperlink"
                  }
                >
                  {isDeleting ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

// Main FileAttachmentManager component - redesigned and improved
const FileAttachmentManager = ({
  requestId,
  presentationAttachments = [],
  actAttachments = [],
  explanationAttachments = [],
  generalAttachments = [],
  hyperLinks = [],
  onDeleteAttachment,
  onDeleteHyperlink,
  isProcessing = false,
}) => {
  // Define attachment groups to display
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

  // Calculate if we have any content to display
  const hasAnyContent =
    attachmentGroups.some((group) => group.attachments.length > 0) ||
    (hyperLinks && hyperLinks.length > 0);

  if (!hasAnyContent) {
    return (
      <div className="text-center py-6 text-slate-500">
        No attachments or links in this category.
      </div>
    );
  }

  return (
    <div className="file-attachment-manager">
      {/* Render attachment card groups */}
      {attachmentGroups.map((group, index) => (
        <AttachmentCardGroup
          key={`${group.type}-${index}`}
          title={group.title}
          attachments={group.attachments}
          type={group.type}
          onDeleteAttachment={onDeleteAttachment}
          icon={group.icon}
          isProcessing={isProcessing}
        />
      ))}

      {/* Render hyperlink card group */}
      <HyperlinkCardGroup
        hyperLinks={hyperLinks}
        onDeleteHyperlink={onDeleteHyperlink}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default FileAttachmentManager;