// File: components/email/EmailView.jsx
import React from "react";
import { Reply, ReplyAll, Forward, Maximize2 } from "lucide-react";
import EmailContent from "./EmailContent";
import AttachmentList from "./AttachmentList";

const EmailView = ({
  selectedEmail,
  userEmail,
  handleReplyClick,
  toggleFullScreen,
  downloadAttachment,
  downloadingAttachmentId,
  colors,
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Email Action Toolbar */}
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-md text-stone-800 text-xs flex items-center bg-[#e6f4f7]"
            onClick={() => handleReplyClick("Reply")}
          >
            <Reply className="h-4 w-4 mr-1.5" />
            <span>Reply</span>
          </button>
          <button
            className="p-2 rounded-md text-stone-800 text-xs flex items-center bg-[#e6f4f7]"
            onClick={() => handleReplyClick("ReplyAll")}
          >
            <ReplyAll className="h-4 w-4 mr-1.5" />
            <span>Reply All</span>
          </button>
          <button
            className="p-2 rounded-md text-stone-800 text-xs flex items-center bg-[#e6f4f7]"
            onClick={() => handleReplyClick("Forward")}
          >
            <Forward className="h-4 w-4 mr-1.5" />
            <span>Forward</span>
          </button>
        </div>
        {/* Full screen button */}
        <button
          className="p-1.5 rounded hover:bg-slate-200"
          onClick={toggleFullScreen}
          title="Full Screen"
        >
          <Maximize2 className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Email Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="text-base font-medium mb-2">{selectedEmail.Subject}</h2>
        <div className="flex">
          <div
            className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-medium mr-3"
            style={{ backgroundColor: colors.primary }}
          >
            {selectedEmail.SenderName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-medium text-xs">
              {selectedEmail.SenderName}{" "}
              {selectedEmail.Sender === userEmail && " (You)"}
              <span className="text-slate-500 ml-1 font-normal">
                &lt;{selectedEmail.Sender}&gt;
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              To: {selectedEmail.To.join(", ")}
              {selectedEmail.CC && selectedEmail.CC.length > 0 && (
                <div className="mt-1">CC: {selectedEmail.CC.join(", ")}</div>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {formatDate(selectedEmail.ReceivedDateTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-auto">
        <EmailContent content={selectedEmail.Body} />
      </div>

      {/* Attachments */}
      {selectedEmail.HasAttachments && selectedEmail.Attachments && (
        <AttachmentList
          attachments={selectedEmail.Attachments}
          downloadAttachment={downloadAttachment}
          downloadingAttachmentId={downloadingAttachmentId}
        />
      )}
    </>
  );
};

export default EmailView;
