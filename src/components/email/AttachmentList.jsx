// File: components/email/AttachmentList.jsx
import React from "react";
import { X, Paperclip, Download, Loader } from "lucide-react";

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
      } p-2 rounded-md text-xs`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div
          className={`p-1.5 ${
            isForwarded ? "bg-amber-100" : "bg-cyan-50"
          } rounded-md mr-2 flex-shrink-0`}
        >
          <Paperclip
            className={`h-3.5 w-3.5 ${
              isForwarded ? "text-amber-600" : "text-cyan-600"
            }`}
          />
        </div>
        <span className="text-slate-700 font-medium truncate mr-2">
          {attachment.Name || attachment.name}
        </span>
        <span className="text-slate-500 flex-shrink-0">
          {isForwarded
            ? `(${attachment.FormattedSize})`
            : `(${formatFileSize(attachment.size)})`}
        </span>
      </div>
      <div className="flex items-center ml-2">
        {isForwarded && (
          <button
            type="button"
            onClick={() => onDownload(attachment)}
            disabled={isDownloading}
            className="p-1.5 mr-1 text-slate-500 hover:text-slate-700 hover:bg-amber-100 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
            title="Download"
          >
            {isDownloading ? (
              <Loader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
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
          <X className="h-3.5 w-3.5" />
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
  if (attachments.length === 0 && forwardedAttachments.length === 0) {
    return (
      <div className="text-xs text-slate-500 text-center py-2">
        No attachments added
      </div>
    );
  }

  return (
    <>
      {/* Forwarded Attachments */}
      {forwardedAttachments.length > 0 && (
        <div className="mb-2">
          <div className="max-h-30 grid grid-cols-2 gap-3 overflow-y-auto px-1">
            {forwardedAttachments.map((attachment) => (
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
        <div className="space-y-2 max-h-32 overflow-y-auto px-1">
          {attachments.map((file) => (
            <AttachmentItem
              key={file.name}
              attachment={file}
              onRemove={onRemoveAttachment}
              isForwarded={false}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default AttachmentList;
