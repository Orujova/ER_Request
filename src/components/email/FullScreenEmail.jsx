// File: components/email/FullScreenEmail.jsx
import React from "react";
import { Minimize2, Reply, ReplyAll, Forward } from "lucide-react";
import EmailContent from "./EmailContent";
import AttachmentList from "./AttachmentList";

const FullScreenEmail = ({
  selectedEmail,
  userEmail,
  toggleFullScreen,
  handleReplyClick,
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header for full screen with gradient background */}
      <div
        className="flex justify-between items-center px-4 py-3 text-white shadow-md"
        style={{
          background: `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
        }}
      >
        <h2 className="font-medium text-lg truncate max-w-2xl">
          {selectedEmail.Subject}
        </h2>
        <button
          onClick={toggleFullScreen}
          className="p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
          title="Exit Full Screen"
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      </div>

      {/* Email info and actions */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex mb-4">
          <div
            className="w-12 h-12 rounded-full text-white flex items-center justify-center text-lg font-medium mr-4"
            style={{ backgroundColor: colors.primary }}
          >
            {selectedEmail.SenderName
              ? selectedEmail.SenderName.charAt(0).toUpperCase()
              : "?"}
          </div>
          <div className="flex-1">
            <div className="font-medium text-base">
              {selectedEmail.SenderName}{" "}
              {selectedEmail.Sender === userEmail && " (You)"}
              <span className="text-slate-500 ml-1 font-normal">
                &lt;{selectedEmail.Sender}&gt;
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              To: {selectedEmail.To.join(", ")}
              {selectedEmail.CC && selectedEmail.CC.length > 0 && (
                <div className="mt-1">CC: {selectedEmail.CC.join(", ")}</div>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              eeeee {formatDate(selectedEmail.ReceivedDateTime)}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 py-1">
          <button
            className="px-3 py-2 rounded-md font-medium text-sm flex items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition-colors"
            onClick={() => handleReplyClick("Reply")}
          >
            <Reply className="h-4 w-4 mr-2" />
            <span>Reply</span>
          </button>
          <button
            className="px-3 py-2 rounded-md font-medium text-sm flex items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition-colors"
            onClick={() => handleReplyClick("ReplyAll")}
          >
            <ReplyAll className="h-4 w-4 mr-2" />
            <span>Reply All</span>
          </button>
          <button
            className="px-3 py-2 rounded-md font-medium text-sm flex items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition-colors"
            onClick={() => handleReplyClick("Forward")}
          >
            <Forward className="h-4 w-4 mr-2" />
            <span>Forward</span>
          </button>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-auto bg-white">
        <EmailContent content={selectedEmail.Body} />
      </div>

      {/* Attachments */}
      {selectedEmail.HasAttachments && selectedEmail.Attachments && (
        <AttachmentList
          attachments={selectedEmail.Attachments}
          downloadAttachment={downloadAttachment}
          downloadingAttachmentId={downloadingAttachmentId}
          fullScreen={true}
        />
      )}
    </div>
  );
};

export default FullScreenEmail;
