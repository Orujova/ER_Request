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
  return (
    <div className="flex flex-col h-[950px] bg-white">
      {/* Header for full screen */}
      <div className="flex justify-between items-center px-3 py-2 bg-slate-50 border-b border-slate-200">
        <h2 className="font-medium text-base text-slate-800">
          {selectedEmail.Subject}
        </h2>
        <button
          onClick={toggleFullScreen}
          className="p-2 rounded-md hover:bg-slate-200"
          title="Exit Full Screen"
        >
          <Minimize2 className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Email info and actions */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white">
        <div className="flex mb-3">
          <div
            className="w-12 h-12 rounded-full text-white flex items-center justify-center text-sm font-medium mr-4"
            style={{ backgroundColor: colors.primary }}
          >
            {selectedEmail.SenderName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">
              {selectedEmail.SenderName}{" "}
              {selectedEmail.Sender === userEmail && " (You)"}
              <span className="text-slate-500 ml-1 font-normal text-sm">
                &lt;{selectedEmail.Sender}&gt;
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              To: {selectedEmail.To.join(", ")}
              {selectedEmail.CC && selectedEmail.CC.length > 0 && (
                <div className="mt-1">CC: {selectedEmail.CC.join(", ")}</div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 py-1">
          <button
            className="px-2 py-1 rounded-md font-medium text-xs flex items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-700"
            onClick={() => handleReplyClick("Reply")}
          >
            <Reply className="h-3 w-3 mr-2" />
            <span>Reply</span>
          </button>
          <button
            className="px-2 py-1 rounded-md font-medium text-xs flex items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-700"
            onClick={() => handleReplyClick("ReplyAll")}
          >
            <ReplyAll className="h-3 w-3 mr-2" />
            <span>Reply All</span>
          </button>
          <button
            className="px-2 py-1 rounded-md font-medium text-xs flex items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-700"
            onClick={() => handleReplyClick("Forward")}
          >
            <Forward className="h-3 w-3 mr-2" />
            <span>Forward</span>
          </button>
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
          fullScreen={true}
        />
      )}
    </div>
  );
};

export default FullScreenEmail;
