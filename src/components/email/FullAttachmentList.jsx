// File: components/email/AttachmentList.jsx
import React from "react";
import { Paperclip, Download } from "lucide-react";

const AttachmentItem = ({
  attachment,
  downloadAttachment,
  downloadingAttachmentId,
  fullScreen = false,
}) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div
      className={`flex items-center ${
        fullScreen
          ? "px-3 py-2 border border-slate-200 rounded-md bg-white hover:shadow-sm transition-shadow"
          : "p-2 border border-slate-200 rounded-md bg-white hover:shadow-sm transition-shadow"
      }`}
    >
      <div className={`${fullScreen ? "p-1" : "p-2"} rounded bg-cyan-100`}>
        <Paperclip
          className={`${fullScreen ? "h-3 w-3" : "h-4 w-4"} text-cyan-600`}
        />
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div
          className={`${
            fullScreen ? "text-sm" : "text-xs"
          } font-medium truncate`}
        >
          {attachment.Name}
        </div>
        {!fullScreen && (
          <div className="text-[0.6rem] text-slate-500 mt-0.5">
            {formatFileSize(attachment.size)}
          </div>
        )}
      </div>
      <button
        onClick={() => downloadAttachment(attachment)}
        disabled={downloadingAttachmentId === attachment.Id}
        className="ml-auto p-1.5 hover:bg-slate-100 rounded-full transition disabled:opacity-50"
        title="Download"
      >
        {downloadingAttachmentId === attachment.Id ? (
          <div className="h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="h-4 w-4 text-slate-600" />
        )}
      </button>
    </div>
  );
};

const AttachmentList = ({
  attachments,
  downloadAttachment,
  downloadingAttachmentId,
  fullScreen = false,
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div
      className={`${
        fullScreen ? "px-4 py-1" : "p-2"
      } border-t border-slate-200 bg-slate-50`}
    >
      <h3 className="font-medium text-sm mb-3 flex items-center">
        <Paperclip className="h-4 w-4 mr-2 text-slate-500" />
        Attachments ({attachments.length})
      </h3>
      <div
        className={`grid ${
          fullScreen
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2"
        } gap-3`}
      >
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.Id}
            attachment={attachment}
            downloadAttachment={downloadAttachment}
            downloadingAttachmentId={downloadingAttachmentId}
            fullScreen={fullScreen}
          />
        ))}
      </div>
    </div>
  );
};

export default AttachmentList;
