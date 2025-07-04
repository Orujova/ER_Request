import React, { useState } from "react";
import {
  X,
  Paperclip,
  Download,
  Loader,
  ChevronDown,
  ChevronUp,
  PlusCircle, // Geri alma ikonu için
} from "lucide-react";

//==================================================================
// Alt Component: AttachmentItem
//==================================================================
const AttachmentItem = ({
  attachment,
  onRemove,
  onDownload,
  downloadingId,
  isForwarded = false,
  isRemoved = false, // YENİ: Bu ekin silinmek üzere işaretlenip işaretlenmediği
}) => {
  const isDownloading = downloadingId === (attachment.Id || attachment.name);

  const formatFileSize = (bytes) => {
    if (!bytes && attachment.FormattedSize) return attachment.FormattedSize;
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div
      className={`flex items-center justify-between p-1.5 rounded-md text-xs transition-opacity ${
        isForwarded
          ? "bg-amber-50 border border-amber-200"
          : "bg-slate-50 border border-slate-200"
      } ${isRemoved ? "opacity-50" : "opacity-100"}`}
      title={isRemoved ? "This attachment will be removed" : ""}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className={`p-1 rounded-md mr-1.5 flex-shrink-0 ${isForwarded ? "bg-amber-100" : "bg-cyan-50"}`}>
          <Paperclip className={`h-3 w-3 ${isForwarded ? "text-amber-600" : "text-cyan-600"}`} />
        </div>
        <span className={`text-slate-700 font-medium truncate mr-1.5 ${isRemoved ? 'line-through' : ''}`}>
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
            {isDownloading ? <Loader className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          </button>
        )}
        <button
          type="button"
          onClick={onRemove} // Artık direkt onRemove çağrılıyor
          className={`p-1 text-slate-500 hover:text-slate-700 rounded-full transition-colors flex-shrink-0`}
          title={isRemoved ? "Restore this attachment" : "Remove this attachment"}
        >
          {isForwarded ? (
            isRemoved ? (
              <PlusCircle className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-600" />
            )
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};


//==================================================================
// Ana Component: AttachmentList
//==================================================================
const AttachmentList = ({
  attachments = [],
  forwardedAttachments = [],
  onRemoveAttachment,
  // YENİ MANTIĞA UYGUN PROPLAR
  onToggleForwardedAttachment,
  removedAttachmentIds,
  onDownloadAttachment,
  downloadingAttachmentId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(
    attachments.length + forwardedAttachments.length > 4
  );

  const totalAttachments = attachments.length + forwardedAttachments.length;

  if (totalAttachments === 0) {
    return (
      <div className="text-xs text-slate-500 text-center py-1">
        No attachments added
      </div>
    );
  }

  // Gösterilecek ve gizlenecek eklerin hesaplanması
  const visibleAttachments = isCollapsed ? attachments.slice(0, 2) : attachments;
  const visibleForwardedAttachments = isCollapsed ? forwardedAttachments.slice(0, 2) : forwardedAttachments;
  const hiddenCount = totalAttachments - (visibleAttachments.length + visibleForwardedAttachments.length);

  return (
    <div className="space-y-1.5">
      {/* Header with collapse/expand toggle */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <Paperclip className="h-3 w-3 mr-1 text-slate-500" />
          <span className="text-xs font-medium text-slate-700">Attachments ({totalAttachments})</span>
        </div>
        {totalAttachments > 4 && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center"
            title={isCollapsed ? "Show all attachments" : "Collapse attachments"}
          >
            {isCollapsed ? (
              <><ChevronDown className="h-3 w-3 mr-0.5" /><span>Show all</span></>
            ) : (
              <><ChevronUp className="h-3 w-3 mr-0.5" /><span>Collapse</span></>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {/* Forwarded Attachments */}
        {visibleForwardedAttachments.map((attachment) => (
          <AttachmentItem
            key={attachment.Id}
            attachment={attachment}
            onRemove={() => onToggleForwardedAttachment(attachment.Id)}
            isRemoved={removedAttachmentIds.has(attachment.Id)}
            onDownload={onDownloadAttachment}
            downloadingId={downloadingAttachmentId}
            isForwarded={true}
          />
        ))}

        {/* New Attachments */}
        {visibleAttachments.map((file) => (
          <AttachmentItem
            key={file.name}
            attachment={file}
            onRemove={() => onRemoveAttachment(file.name)}
            isForwarded={false}
          />
        ))}
      </div>

      {isCollapsed && hiddenCount > 0 && (
        <div
          className="text-xs text-center text-cyan-600 hover:text-cyan-800 cursor-pointer py-0.5"
          onClick={() => setIsCollapsed(false)}
        >
          + {hiddenCount} more attachment{hiddenCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default AttachmentList;