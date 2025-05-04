import React, { useState } from "react";
import {
  X,
  Paperclip,
  Download,
  Loader,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const AttachmentItem = ({
  attachment,
  onRemove,
  onDownload,
  downloadingId,
  isForwarded = false,
}) => {
  const isDownloading = downloadingId === (attachment.Id || attachment.name);

  // Format file size for new attachments
  const formatFileSize = (bytes) => {
    if (!bytes && attachment.FormattedSize) return attachment.FormattedSize;
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div
      className={`flex items-center justify-between ${
        isForwarded
          ? "bg-amber-50 border border-amber-200"
          : "bg-slate-50 border border-slate-200"
      } p-1.5 rounded-md text-xs`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div
          className={`p-1 ${
            isForwarded ? "bg-amber-100" : "bg-cyan-50"
          } rounded-md mr-1.5 flex-shrink-0`}
        >
          <Paperclip
            className={`h-3 w-3 ${
              isForwarded ? "text-amber-600" : "text-cyan-600"
            }`}
          />
        </div>
        <span className="text-slate-700 font-medium truncate mr-1.5">
          {attachment.Name || attachment.name}
        </span>
        <span className="text-slate-500 flex-shrink-0 text-[10px]">
          {formatFileSize(attachment.size)}
        </span>
      </div>
      <div className="flex items-center ml-1">
        {isForwarded && (
          <button
            type="button"
            onClick={() => onDownload(attachment)}
            disabled={isDownloading}
            className="p-1 mr-0.5 text-slate-500 hover:text-slate-700 hover:bg-amber-100 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
            title="Download"
          >
            {isDownloading ? (
              <Loader className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            onRemove(isForwarded ? attachment.Id : attachment.name)
          }
          className={`p-1 text-slate-500 hover:text-slate-700 hover:bg-${
            isForwarded ? "amber" : "slate"
          }-100 rounded-full transition-colors flex-shrink-0`}
          title="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

const AttachmentList = ({
  attachments = [],
  forwardedAttachments = [],
  onRemoveAttachment,
  onRemoveForwardedAttachment,
  onDownloadAttachment,
  downloadingAttachmentId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(
    attachments.length > 3 || forwardedAttachments.length > 3
  );

  const totalAttachments =
    (attachments?.length || 0) + (forwardedAttachments?.length || 0);

  if (totalAttachments === 0) {
    return (
      <div className="text-xs text-slate-500 text-center py-1">
        No attachments added
      </div>
    );
  }

  // Show all attachments if not collapsed, otherwise show first 2 of each type
  const visibleAttachments = isCollapsed
    ? attachments.slice(0, 2)
    : attachments;
  const visibleForwardedAttachments = isCollapsed
    ? forwardedAttachments.slice(0, 2)
    : forwardedAttachments;

  // Count hidden attachments
  const hiddenAttachmentsCount =
    attachments.length -
    visibleAttachments.length +
    (forwardedAttachments.length - visibleForwardedAttachments.length);

  return (
    <div className="space-y-1 overflow-y-auto">
      {/* Header with collapse/expand toggle */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <Paperclip className="h-3 w-3 mr-1 text-slate-500" />
          <span className="text-xs font-medium text-slate-700">
            Attachments ({totalAttachments})
          </span>
        </div>
        {totalAttachments > 3 && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center"
            title={
              isCollapsed ? "Show all attachments" : "Collapse attachments"
            }
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-3 w-3 mr-0.5" />
                <span>Show all</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-3 w-3 mr-0.5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Forwarded Attachments */}
      {forwardedAttachments.length > 0 && (
        <div className="mb-1">
          <div className="grid grid-cols-2 gap-1.5">
            {visibleForwardedAttachments.map((attachment) => (
              <AttachmentItem
                key={attachment.Id}
                attachment={attachment}
                onRemove={onRemoveForwardedAttachment}
                onDownload={onDownloadAttachment}
                downloadingId={downloadingAttachmentId}
                isForwarded={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* New Attachments */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {visibleAttachments.map((file) => (
            <AttachmentItem
              key={file.name}
              attachment={file}
              onRemove={onRemoveAttachment}
              isForwarded={false}
            />
          ))}
        </div>
      )}

      {/* If attachments are collapsed and there are hidden ones, show count */}
      {isCollapsed && hiddenAttachmentsCount > 0 && (
        <div
          className="text-xs text-center text-cyan-600 hover:text-cyan-800 cursor-pointer py-0.5"
          onClick={() => setIsCollapsed(false)}
        >
          + {hiddenAttachmentsCount} more attachment
          {hiddenAttachmentsCount !== 1 && "s"}
        </div>
      )}
    </div>
  );
};

export default AttachmentList;
