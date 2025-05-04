import React, { useRef } from "react";
import { Reply, ReplyAll, Forward, Maximize2 } from "lucide-react";
import ImprovedEmailContent from "./EmailContent";
import AttachmentList from "./AttachmentList";

const ImprovedEmailView = ({
  selectedEmail,
  userEmail,
  handleReplyClick,
  toggleFullScreen,
  downloadAttachment,
  downloadingAttachmentId,
  colors,
}) => {
  const containerRef = useRef(null);

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
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden">
      {/* Email Action Toolbar */}
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <button
            className="p-1.5 rounded-md text-stone-700 text-xs flex items-center bg-[#e6f4f7] hover:bg-[#d1edf3] transition-colors"
            onClick={() => handleReplyClick("Reply")}
          >
            <Reply className="h-3.5 w-3.5 mr-1" />
            <span>Reply</span>
          </button>
          <button
            className="p-1.5 rounded-md text-stone-700 text-xs flex items-center bg-[#e6f4f7] hover:bg-[#d1edf3] transition-colors"
            onClick={() => handleReplyClick("ReplyAll")}
          >
            <ReplyAll className="h-3.5 w-3.5 mr-1" />
            <span>Reply All</span>
          </button>
          <button
            className="p-1.5 rounded-md text-stone-700 text-xs flex items-center bg-[#e6f4f7] hover:bg-[#d1edf3] transition-colors"
            onClick={() => handleReplyClick("Forward")}
          >
            <Forward className="h-3.5 w-3.5 mr-1" />
            <span>Forward</span>
          </button>
        </div>
        {/* Full screen button */}
        <button
          className="p-1.5 rounded hover:bg-slate-200"
          onClick={toggleFullScreen}
          title="Full Screen"
        >
          <Maximize2 className="h-3.5 w-3.5 text-slate-600" />
        </button>
      </div>

      {/* Email Header */}
      <div className="px-3 py-2 border-b border-slate-200">
        <h2 className="text-sm font-medium mb-1.5">{selectedEmail.Subject}</h2>
        <div className="flex">
          <div
            className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-medium mr-2"
            style={{ backgroundColor: colors.primary }}
          >
            {selectedEmail.SenderName?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-xs truncate">
              {selectedEmail.SenderName}{" "}
              {selectedEmail.Sender === userEmail && " (You)"}
              <span className="text-slate-500 ml-1 font-normal truncate">
                &lt;{selectedEmail.Sender}&gt;
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              To: {selectedEmail.To.join(", ")}
              {selectedEmail.CC && selectedEmail.CC.length > 0 && (
                <div className="mt-0.5 truncate">
                  CC: {selectedEmail.CC.join(", ")}
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {formatDate(selectedEmail.ReceivedDateTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area with padding at bottom for attachments */}
      <div className="flex-1 overflow-auto">
        <div className="pb-16">
          {" "}
          {/* Extra bottom padding to ensure content is visible */}
          <ImprovedEmailContent content={selectedEmail.Body} />
        </div>
      </div>

      {/* Attachments - Fixed positioned at bottom */}
      {selectedEmail.HasAttachments && selectedEmail.Attachments && (
        <div className="border-t border-slate-200 p-2 bg-white sticky bottom-0 left-0 right-0 shadow-md">
          <AttachmentList
            attachments={selectedEmail.Attachments}
            onRemoveAttachment={() => {}}
            onDownloadAttachment={downloadAttachment}
            downloadingAttachmentId={downloadingAttachmentId}
          />
        </div>
      )}
    </div>
  );
};

export default ImprovedEmailView;
